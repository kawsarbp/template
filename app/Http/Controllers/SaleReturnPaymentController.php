<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\SaleReturn\DeleteSaleReturnPaymentAction;
use App\Actions\SaleReturn\StoreSaleReturnPaymentAction;
use App\Http\Requests\SaleReturn\StoreSaleReturnPaymentRequest;
use App\Models\SaleReturn;
use App\Models\SaleReturnPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use niklasravnsborg\LaravelPdf\Facades\Pdf;

class SaleReturnPaymentController extends Controller
{
    public function store(
        SaleReturn $saleReturn,
        StoreSaleReturnPaymentRequest $request,
        StoreSaleReturnPaymentAction $action,
    ) {
        abort_if(! auth()->user()->can('create sale return'), 403);
        $payment = $action->execute($saleReturn, $request->validated());

        return redirect()->back()->with([
            'success' => __('Refund payment added successfully.'),
            'redirect_url' => '/sale-return-payments/receipt?payment_id='.$payment->id,
        ]);
    }

    public function destroy(SaleReturnPayment $payment, DeleteSaleReturnPaymentAction $action)
    {
        abort_if(! auth()->user()->can('delete sale return'), 403);
        $action->execute($payment);

        return redirect()->back()->with('success', __('Refund payment deleted successfully.'));
    }

    public function paymentReceipt(Request $request)
    {
        abort_if(! auth()->user()->can('manage sale return'), 403);
        $paymentId = $request->get('payment_id');
        if (empty($paymentId)) {
            return response()->json(['success' => false, 'error' => 'Invalid Payment ID'], 400);
        }

        try {
            $payment = SaleReturnPayment::with([
                'saleReturn.customer',
                'saleReturn.payments',
                'saleReturn.items.stock.product.brand',
                'saleReturn.items.stock.condition',
                'saleReturn.items.stockPurchase',
                'bankAccount',
            ])
                ->where('id', $paymentId)
                ->firstOrFail();

            $pdf = Pdf::loadView(
                'sale_return.payment_receipt_pdf',
                compact('payment'),
                [],
                [
                    'format' => 'A4',
                    'defaultFont' => 'sans-serif',
                    'curlAllowUnsafeSslRequests' => true,
                    'showImageErrors' => true,
                ]
            );

            return $pdf->stream('Return_Receipt_'.$payment->saleReturn->return_number.'.pdf');
        } catch (\Exception $e) {
            Log::info($e->getMessage());

            return response()->json(['error' => 'Something went wrong: '.$e->getMessage()]);
        }
    }
}
