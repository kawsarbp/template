<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Product\DeleteProductAction;
use App\Actions\Product\ListProductsAction;
use App\Actions\Product\StoreProductAction;
use App\Actions\Product\UpdateProductAction;
use App\Enums\StockStatus;
use App\Exports\ProductsExport;
use App\Http\Requests\Product\ImportProductRequest;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\Product\ProductDetailResource;
use App\Http\Resources\Product\ProductListResource;
use App\Imports\ProductImport;
use App\Models\Product;
use App\Traits\WithActiveFilters;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Response;
use Inertia\ResponseFactory;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ProductController extends Controller
{
    use WithActiveFilters;

    /**
     * @return Response|ResponseFactory
     */
    public function index(Request $request, ListProductsAction $listProductsAction)
    {
        $products = $listProductsAction->execute(
            filters: $request->all(),
            perPage: (int) $request->input('limit', 15)
        );

        return inertia('Product/Products', [
            'data' => ProductListResource::collection($products)->additional($this->getActiveFilters($request->all(), ['brand'])),
        ]);
    }

    /**
     * @return RedirectResponse
     */
    public function store(StoreProductRequest $request, StoreProductAction $storeProductAction)
    {
        $storeProductAction->execute($request->validated());

        return redirect()->back()->with('success', __('Product added successfully.'));
    }

    public function show(Product $product, Request $request): ProductDetailResource|Response|ResponseFactory
    {
        $product->loadCount(['stocks as available_stock_count' => fn ($q) => $q->where('status', StockStatus::AVAILABLE)])
            ->load(['activity_log', 'brand']);

        if ($request->expectsJson()) {
            return new ProductDetailResource($product);
        }

        return inertia('Product/ProductDetail', ['data' => new ProductDetailResource($product)]);
    }

    /**
     * @return RedirectResponse
     */
    public function update(UpdateProductRequest $request, Product $product, UpdateProductAction $updateProductAction)
    {
        $updateProductAction->execute($product, $request->validated());

        return redirect()->back()->with('success', __('Product updated successfully.'));
    }

    /**
     * @return RedirectResponse
     */
    public function destroy(Product $product, DeleteProductAction $deleteProductAction)
    {
        $deleteProductAction->execute($product);

        return redirect()->back()->with('success', __('Product deleted successfully.'));
    }

    /**
     * Export products to Excel.
     */
    public function exportExcel(Request $request): BinaryFileResponse
    {
        return Excel::download(new ProductsExport($request->all()), 'products.xlsx');
    }

    /**
     * Import products from a CSV file.
     */
    public function importCsv(ImportProductRequest $request): RedirectResponse
    {
        try {
            Excel::import(new ProductImport, $request->file('file'));

            return redirect()->back()->with('success', __('Products imported successfully.'));
        } catch (ValidationException $e) {
            throw $e;
        }
    }
}
