<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Supplier\DeleteSupplierAction;
use App\Actions\Supplier\ListSuppliersAction;
use App\Actions\Supplier\StoreSupplierAction;
use App\Actions\Supplier\UpdateSupplierAction;
use App\Exports\SuppliersExport;
use App\Http\Requests\Supplier\StoreSupplierRequest;
use App\Http\Requests\Supplier\UpdateSupplierRequest;
use App\Http\Resources\Supplier\SupplierDetailResource;
use App\Http\Resources\Supplier\SupplierListResource;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\ResponseFactory;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SupplierController extends Controller
{
    /**
     * Display a listing of suppliers with filtering.
     */
    public function index(Request $request, ListSuppliersAction $listSuppliersAction)
    {
        $filters = $request->all();

        $suppliers = $listSuppliersAction->execute(
            filters: $filters,
            perPage: (int) $request->input('limit', 15)
        );

        return inertia('Supplier/Suppliers', [
            'data' => SupplierListResource::collection($suppliers),
        ]);
    }

    /**
     * Store a newly created supplier.
     */
    public function store(StoreSupplierRequest $request, StoreSupplierAction $storeSupplierAction)
    {
        $storeSupplierAction->execute($request->validated());

        return redirect()->back()->with('success', __('Supplier added successfully.'));
    }

    /**
     * Display the specified supplier.
     */
    public function show(Supplier $supplier, Request $request): SupplierDetailResource|Response|ResponseFactory
    {
        $supplier->load(['activity_log']);

        if ($request->expectsJson()) {
            return new SupplierDetailResource($supplier);
        }

        return inertia('Supplier/SupplierDetail', ['data' => new SupplierDetailResource($supplier)]);
    }

    /**
     * Update the specified supplier.
     */
    public function update(UpdateSupplierRequest $request, Supplier $supplier, UpdateSupplierAction $updateSupplierAction)
    {
        $updateSupplierAction->execute($supplier, $request->validated());

        return redirect()->back()->with('success', __('Supplier updated successfully.'));
    }

    /**
     * Remove the specified supplier.
     */
    public function destroy(Supplier $supplier, DeleteSupplierAction $deleteSupplierAction)
    {
        $deleteSupplierAction->execute($supplier);

        return redirect()->back()->with('success', __('Supplier deleted successfully.'));
    }

    /**
     * Export suppliers to Excel.
     */
    public function exportExcel(Request $request): BinaryFileResponse
    {
        return Excel::download(new SuppliersExport($request->all()), 'suppliers.xlsx');
    }
}
