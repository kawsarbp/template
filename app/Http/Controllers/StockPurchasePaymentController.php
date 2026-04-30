<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Stock\AddStockPurchaseBulkPaymentAction;
use App\Actions\Stock\DeleteStockPurchasePaymentAction;
use App\Actions\Stock\ListStockPurchasesAction;
use App\Actions\Stock\StoreStockPurchasePaymentAction;
use App\Actions\Stock\UpdateStockPurchasePaymentAction;
use App\Http\Requests\Stock\StoreMultiStockPurchasePaymentRequest;
use App\Http\Requests\Stock\StoreStockPurchasePaymentRequest;
use App\Http\Requests\Stock\UpdateStockPurchasePaymentRequest;
use App\Http\Resources\Stock\StockPurchaseListResource;
use App\Http\Resources\Supplier\SupplierDetailResource;
use App\Models\StockPurchase;
use App\Models\StockPurchasePayment;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use niklasravnsborg\LaravelPdf\Facades\Pdf;

class StockPurchasePaymentController extends Controller
{
    /**
     * Store a payment for a stock purchase.
     */
    public function store(
        StockPurchase $stockPurchase,
        StoreStockPurchasePaymentRequest $request,
        StoreStockPurchasePaymentAction $action,
    ) {

        $action->execute($stockPurchase, $request->validated());

        return redirect()->back()->with('success', __('Payment added successfully.'));
    }

    /**
     * Update a stock purchase payment.
     */
    public function update(
        StockPurchasePayment $payment,
        UpdateStockPurchasePaymentRequest $request,
        UpdateStockPurchasePaymentAction $action,
    ) {
        $action->execute($payment, $request->validated());

        return redirect()->back()->with('success', __('Payment updated successfully.'));
    }

    /**
     * Delete a stock purchase payment.
     */
    public function destroy(StockPurchasePayment $payment, DeleteStockPurchasePaymentAction $action)
    {
        $action->execute($payment);

        return redirect()->back()->with('success' , __('Payment deleted successfully.'));
    }

    /**
     * Add bulk payment to multiple stock purchases.
     */
    public function bulkStore(StoreMultiStockPurchasePaymentRequest $request, AddStockPurchaseBulkPaymentAction $action)
    {
        $action->execute($request->validated());

        return redirect()->back()->with('success', __('Bulk payment added successfully.'));
    }

    public function bulkPayment(Request $request, ListStockPurchasesAction $listStockPurchasesAction)
    {
        return inertia('Stock/StockMultiplePayment', [
            'supplier' => new SupplierDetailResource(Supplier::findOrFail($request->supplier_id)),
            'data' => StockPurchaseListResource::collection(
                $listStockPurchasesAction->all($request->only(['supplier_id', 'ids']))
            ),
        ]);
    }

    public function multiplePaymentReceipt(Request $request)
    {
        $paymentId = $request->get('payment_id');
        if (empty($paymentId)) {
            return response()->json(['success' => false, 'error' => 'Invalid Payment ID'], 400);
        }

        try {
            $stockPurchasePayment = StockPurchasePayment::with(['stockPurchase.supplier', 'stockPurchase.payments'])
                ->where('id', $paymentId)
                ->firstOrFail();

            $paymentData = collect();
            if ($stockPurchasePayment->is_bulk_payment) {
                $paymentData = StockPurchasePayment::with([
                    'stockPurchase.supplier',
                    'stockPurchase.payments',
                ])
                    ->where('parent_id', $paymentId)
                    ->get();
            } else {
                $paymentData = StockPurchasePayment::with([
                    'stockPurchase.supplier',
                    'stockPurchase.payments',
                ])
                    ->where('id', $paymentId)
                    ->get();
            }

            $pdf = Pdf::loadView(
                'stock_purchase.multi_payment_pdf',
                compact('stockPurchasePayment', 'paymentData'),
                [],
                [
                    'format' => 'A4',
                    'defaultFont' => 'sans-serif',
                    'curlAllowUnsafeSslRequests' => true,
                    'showImageErrors' => true,
                ]
            );

            $batchNumber = $stockPurchasePayment->is_bulk_payment
                ? $paymentData->first()?->stockPurchase?->batch_number
                : $stockPurchasePayment->stockPurchase?->batch_number;

            return $pdf->stream('Payment_Voucher_'.$batchNumber.'.pdf');
        } catch (\Exception $e) {
            Log::info($e->getMessage());

            return response()->json(['error' => 'Something Wrong.'.$e->getMessage()]);
        }
    }
}
