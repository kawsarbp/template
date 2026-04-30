<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Sale\DeleteSaleAction;
use App\Actions\Sale\ListSalesAction;
use App\Actions\Sale\StoreSaleAction;
use App\Actions\Sale\UpdateSaleAction;
use App\Http\Requests\Sale\ImportSaleRequest;
use App\Http\Requests\Sale\StoreSaleRequest;
use App\Http\Requests\Sale\UpdateSaleRequest;
use App\Http\Resources\Sale\SaleDetailResource;
use App\Http\Resources\Sale\SaleListResource;
use App\Imports\SaleImport;
use App\Models\Sale;
use App\Traits\WithActiveFilters;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Response;
use Inertia\ResponseFactory;
use Maatwebsite\Excel\Facades\Excel;

class SaleController extends Controller
{
    use WithActiveFilters;

    /**
     * Display a listing of sales with filtering.
     */
    public function index(Request $request, ListSalesAction $listSalesAction)
    {
        $filters = $request->all();

        $sales = $listSalesAction->execute(
            filters: $filters,
            perPage: (int) $request->input('limit', 15)
        );

        $summaryRow = $listSalesAction->query($filters)
            ->reorder()
            ->toBase()
            ->selectRaw('SUM(total_amount) as total_amount, SUM(total_paid) as total_paid, SUM(total_due) as total_due')
            ->first();

        return inertia('Sale/Sales', [
            'data' => SaleListResource::collection($sales)
                ->additional(array_merge(
                    $this->getActiveFilters($request->all(), ['customer']),
                    ['summary' => [
                        'total_amount' => (float) ($summaryRow->total_amount ?? 0),
                        'total_paid' => (float) ($summaryRow->total_paid ?? 0),
                        'total_due' => (float) ($summaryRow->total_due ?? 0),
                    ]]
                )),
        ]);
    }

    /**
     * Show the create sale page.
     */
    public function create(): Response|ResponseFactory
    {
        return inertia('Sale/CreateSale');
    }

    /**
     * Show the edit sale page.
     */
    public function edit(Sale $sale): Response|ResponseFactory
    {
        $sale->load(['customer', 'items.stock.product.brand', 'items.stock.condition', 'items.stockPurchase']);

        return inertia('Sale/CreateSale', [
            'sale' => new SaleDetailResource($sale),
        ]);
    }

    /**
     * Store a newly created sale.
     */
    public function store(StoreSaleRequest $request, StoreSaleAction $storeSaleAction)
    {
        $result = $storeSaleAction->execute($request->validated());

        $flash = ['success' => __('Sale created successfully.')];

        if ($result['payment_id'] !== null) {
            $flash['redirect_url'] = '/sales/multi-payment-receipt?payment_id='.$result['payment_id'];
        }

        return redirect()->back()->with($flash);
    }

    /**
     * Display the specified sale.
     */
    public function show(Sale $sale, Request $request): SaleDetailResource|Response|ResponseFactory
    {
        $sale->load(['customer', 'items.stock.product.brand', 'items.stock.condition', 'items.stockPurchase', 'payments.bankAccount', 'activity_log']);

        if ($request->expectsJson()) {
            return new SaleDetailResource($sale);
        }

        return inertia('Sale/SaleDetail', ['data' => new SaleDetailResource($sale)]);
    }

    /**
     * Update the specified sale.
     */
    public function update(UpdateSaleRequest $request, Sale $sale, UpdateSaleAction $updateSaleAction)
    {
        $updateSaleAction->execute($sale, $request->validated());

        return redirect()->back()->with('success', __('Sale updated successfully.'));
    }

    /**
     * Remove the specified sale.
     */
    public function destroy(Sale $sale, DeleteSaleAction $deleteSaleAction)
    {
        try {
            $deleteSaleAction->execute($sale);
        } catch (ValidationException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', __('Sale deleted successfully.'));
    }

    /**
     * Import sales from a CSV file.
     */
    public function importCsv(ImportSaleRequest $request): RedirectResponse
    {
        try {
            $import = new SaleImport(
                customerId: $request->validated('customer_id') ? (int) $request->validated('customer_id') : null,
                saleType: (int) $request->validated('sale_type'),
                saleDate: $request->validated('sale_date'),
                discount: (float) ($request->validated('discount') ?? 0),
                payment: (float) ($request->validated('payment') ?? 0),
                notes: $request->validated('notes'),
            );

            Excel::import($import, $request->file('file'));

            return redirect()->back()->with('success', __('Sales imported successfully.'));
        } catch (ValidationException $e) {
            throw $e;
        }
    }

    /**
     * Generate invoice PDF for the specified sale.
     */
    public function invoicePdf(Sale $sale): \Illuminate\Http\Response|\Symfony\Component\HttpFoundation\Response
    {
        $sale->load(['customer', 'items.stock.product.brand', 'items.stock.condition', 'items.stockPurchase']);

        try {
            $pdf = Pdf::loadView(
                'sale.invoice_pdf',
                compact('sale')
            )->setPaper('a4', 'portrait')->setOptions(['defaultFont' => 'sans-serif', 'isRemoteEnabled' => true]);

            return $pdf->stream("invoice-{$sale->sale_number}.pdf");

        } catch (\Exception $e) {
            Log::error('Invoice PDF generation failed: '.$e->getMessage());

            return response()->json(['error' => 'Failed to generate invoice PDF.']);
        }
    }
}
