<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Sale\AddSaleBulkPaymentAction;
use App\Actions\Sale\DeleteSalePaymentAction;
use App\Actions\Sale\ListSalesAction;
use App\Actions\Sale\StoreSalePaymentAction;
use App\Actions\Sale\UpdateSalePaymentAction;
use App\Http\Requests\Sale\StoreMultiSalePaymentRequest;
use App\Http\Requests\Sale\StoreSalePaymentRequest;
use App\Http\Requests\Sale\UpdateSalePaymentRequest;
use App\Http\Resources\Customer\CustomerDetailResource;
use App\Http\Resources\Sale\SaleListResource;
use App\Models\Customer;
use App\Models\Sale;
use App\Models\SalePayment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Response;
use Inertia\ResponseFactory;
use niklasravnsborg\LaravelPdf\Facades\Pdf;

class SalePaymentController extends Controller
{
    /**
     * Store a payment for a sale.
     */
    public function store(
        Sale $sale,
        StoreSalePaymentRequest $request,
        StoreSalePaymentAction $action,
    ) {
        $payment = $action->execute($sale, $request->validated());

        return redirect()->back()->with([
            'success' => __('Payment added successfully.'),
            'redirect_url' => '/sales/multi-payment-receipt?payment_id='.$payment->id,
        ]);
    }

    /**
     * Update a sale payment.
     */
    public function update(SalePayment $payment, UpdateSalePaymentRequest $request, UpdateSalePaymentAction $action)
    {
        $action->execute($payment, $request->validated());

        return redirect()->back()->with('success', __('Payment updated successfully.'));
    }

    /**
     * Delete a sale payment.
     */
    public function destroy(SalePayment $payment, DeleteSalePaymentAction $action)
    {
        $action->execute($payment);

        return redirect()->back()->with('success', __('Payment deleted successfully.'));
    }

    /**
     * @return Response|ResponseFactory
     */
    public function bulkPayment(Request $request, ListSalesAction $listSalesAction)
    {
        return inertia('Sale/SaleMultiplePayment', [
            'customer' => new CustomerDetailResource(Customer::findOrFail($request->customer_id)),
            'data' => SaleListResource::collection(
                $listSalesAction->all($request->only(['customer_id', 'ids']))
            ),
        ]);
    }

    /**
     * @return RedirectResponse
     */
    public function bulkStore(StoreMultiSalePaymentRequest $request, AddSaleBulkPaymentAction $action)
    {
        $action->execute($request->validated());

        return redirect()->back()->with('success', __('Bulk payment added successfully.'));
    }

    public function multiplePaymentReceipt(Request $request)
    {
        $paymentId = $request->get('payment_id');
        if (empty($paymentId)) {
            return response()->json(['success' => false, 'error' => 'Invalid Payment ID'], 400);
        }

        try {
            $salePayment = SalePayment::with(['sale.customer', 'sale.payments'])
                ->where('id', $paymentId)
                ->firstOrFail();

            $paymentData = [];
            if ($salePayment) {
                $paymentData = SalePayment::with(['sale.customer', 'sale.payments'])
                    ->whereIn('id', $salePayment->group_payment_ids ?? [$paymentId])
                    ->get();
            }

            $pdf = Pdf::loadView(
                'sale.multi_payment_receipt_pdf',
                compact('salePayment', 'paymentData'),
                [],
                [
                    'format' => 'A4',
                    'defaultFont' => 'sans-serif',
                    'curlAllowUnsafeSslRequests' => true,
                    'showImageErrors' => true,
                ]
            );

            return $pdf->stream('Receipt_Voucher_'.$salePayment->sale->sale_number.'.pdf');
        } catch (\Exception $e) {
            Log::info($e->getMessage());

            return response()->json(['error' => 'Something Wrong.'.$e->getMessage()]);
        }
    }
}
