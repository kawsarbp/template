<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Stock\DeleteStockPurchaseAction;
use App\Actions\Stock\ListStockPurchasesAction;
use App\Actions\Stock\StoreStockPurchaseAction;
use App\Actions\Stock\UpdateStockPurchaseAction;
use App\Exports\StockPurchasesExport;
use App\Http\Requests\Stock\ImportStockPurchaseRequest;
use App\Http\Requests\Stock\StoreStockPurchaseRequest;
use App\Http\Requests\Stock\UpdateStockPurchaseRequest;
use App\Http\Resources\Stock\StockPurchaseDetailResource;
use App\Http\Resources\Stock\StockPurchaseListResource;
use App\Imports\StockPurchaseImport;
use App\Models\StockPurchase;
use App\Traits\WithActiveFilters;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Response;
use Inertia\ResponseFactory;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class StockPurchaseController extends Controller
{
    use WithActiveFilters;

    /**
     * Display a listing of stock purchases with filtering.
     */
    public function index(Request $request, ListStockPurchasesAction $listStockPurchasesAction)
    {
        $filters = $request->all();

        $purchases = $listStockPurchasesAction->execute(
            filters: $filters,
            perPage: (int) $request->input('limit', 15)
        );

        $summaryRow = $listStockPurchasesAction->query($filters)
            ->reorder()
            ->toBase()
            ->selectRaw('
                SUM(CASE WHEN currency = ? THEN total_amount * COALESCE(exchange_rate, 1) ELSE total_amount END) as total_amount,
                SUM(CASE WHEN currency = ? THEN total_paid * COALESCE(exchange_rate, 1) ELSE total_paid END) as total_paid,
                SUM(CASE WHEN currency = ? THEN total_due * COALESCE(exchange_rate, 1) ELSE total_due END) as total_due
            ', ['HKD', 'HKD', 'HKD'])
            ->first();

        return inertia('Stock/StockPurchases', [
            'data' => StockPurchaseListResource::collection($purchases)
                ->additional(array_merge(
                    $this->getActiveFilters($request->all(), ['supplier']),
                    ['summary' => [
                        'total_amount' => (float) ($summaryRow->total_amount ?? 0),
                        'total_paid' => (float) ($summaryRow->total_paid ?? 0),
                        'total_due' => (float) ($summaryRow->total_due ?? 0),
                    ]]
                )),
        ]);
    }

    /**
     * Store a newly created stock purchase.
     */
    public function store(StoreStockPurchaseRequest $request, StoreStockPurchaseAction $storeStockPurchaseAction)
    {
        $storeStockPurchaseAction->execute($request->validated());

        return redirect()->back()->with('success', __('Stock purchase created successfully.'));
    }

    /**
     * Display the specified stock purchase.
     */
    public function show(StockPurchase $stockPurchase, Request $request): StockPurchaseDetailResource|Response|ResponseFactory
    {
        $stockPurchase->load(['supplier', 'items.product.brand', 'items.condition', 'stocks.product.brand', 'stocks.condition', 'payments.bankAccount', 'activity_log','stocks.stockPurchaseItem.stockPurchase']);

        if ($request->expectsJson()) {
            return new StockPurchaseDetailResource($stockPurchase);
        }

        return inertia('Stock/StockPurchaseDetail', ['data' => new StockPurchaseDetailResource($stockPurchase)]);
    }

    /**
     * Update the specified stock purchase.
     */
    public function update(UpdateStockPurchaseRequest $request, StockPurchase $stockPurchase, UpdateStockPurchaseAction $updateStockPurchaseAction)
    {
        $updateStockPurchaseAction->execute($stockPurchase, $request->validated());

        return redirect()->back()->with('success', __('Stock purchase updated successfully.'));
    }

    /**
     * Remove the specified stock purchase.
     */
    public function destroy(StockPurchase $stockPurchase, DeleteStockPurchaseAction $deleteStockPurchaseAction)
    {
        try {
            $deleteStockPurchaseAction->execute($stockPurchase);
        } catch (ValidationException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', __('Stock purchase deleted successfully.'));
    }

    /**
     * Export stock purchases to Excel.
     */
    public function exportExcel(Request $request): BinaryFileResponse
    {
        return Excel::download(new StockPurchasesExport($request->all()), 'stock-purchases.xlsx');
    }

    /**
     * Import stock purchases from a CSV file.
     */
    public function importCsv(ImportStockPurchaseRequest $request): RedirectResponse
    {
        try {
            $import = new StockPurchaseImport(
                batchNumber: $request->validated('batch_number'),
                supplierId: (int) $request->validated('supplier_id'),
                purchaseDate: $request->validated('purchase_date'),
                discount: (float) ($request->validated('discount') ?? 0),
                notes: $request->validated('notes'),
            );

            Excel::import($import, $request->file('file'));

            return redirect()->back()->with('success', __('Stock purchases imported successfully.'));
        } catch (ValidationException $e) {
            throw $e;
        }
    }

    public function stockPurchasesPdf($id)
    {
        $stockPurchase = StockPurchase::with(['items.product.brand', 'items.stocks'])->find($id);

        $pdf = Pdf::loadView(
            'stock_purchase.stock_purchase_pdf',
            compact('stockPurchase')
        )->setPaper('a4', 'portrait')->setOptions(['defaultFont' => 'sans-serif', 'isRemoteEnabled' => true]);

        return $pdf->stream();
    }
}
