<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Brand\DeleteBrandAction;
use App\Actions\Brand\ListBrandsAction;
use App\Actions\Brand\StoreBrandAction;
use App\Actions\Brand\UpdateBrandAction;
use App\Http\Requests\Brand\StoreBrandRequest;
use App\Http\Requests\Brand\UpdateBrandRequest;
use App\Http\Resources\Brand\BrandDetailResource;
use App\Http\Resources\Brand\BrandListResource;
use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\ResponseFactory;

class BrandController extends Controller
{
    /**
     * Display a listing of brands with filtering.
     */
    public function index(Request $request, ListBrandsAction $listBrandsAction)
    {
        $filters = $request->all();

        $brands = $listBrandsAction->execute(
            filters: $filters,
            perPage: (int) $request->input('limit', 15)
        );

        return inertia('Brand/Brands', [
            'data' => BrandListResource::collection($brands),
        ]);
    }

    /**
     * Store a newly created brand.
     */
    public function store(StoreBrandRequest $request, StoreBrandAction $storeBrandAction)
    {
        $storeBrandAction->execute($request->validated());

        return redirect()->back()->with('success', __('Brand added successfully.'));
    }

    /**
     * Display the specified brand.
     */
    public function show(Brand $brand, Request $request): BrandDetailResource|Response|ResponseFactory
    {
        $brand->load(['activity_log']);

        if ($request->expectsJson()) {
            return new BrandDetailResource($brand);
        }

        return inertia('Brand/Brands', ['data' => new BrandDetailResource($brand)]);
    }

    /**
     * Update the specified brand.
     */
    public function update(UpdateBrandRequest $request, Brand $brand, UpdateBrandAction $updateBrandAction)
    {
        $updateBrandAction->execute($brand, $request->validated());

        return redirect()->back()->with('success', __('Brand updated successfully.'));
    }

    /**
     * Remove the specified brand.
     */
    public function destroy(Brand $brand, DeleteBrandAction $deleteBrandAction)
    {
        $deleteBrandAction->execute($brand);

        return redirect()->back()->with('success', __('Brand deleted successfully.'));
    }
}
