<?php

declare(strict_types=1);

namespace App\Actions\Stock;

use App\Enums\VoucherType;
use App\Models\StockPurchase;
use App\Models\StockPurchasePayment;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AddStockPurchaseBulkPaymentAction
{
    public function execute(array $data)
    {
        $totalStockPurchaseId = $data['stock_purchase_ids'];
        $paymentArr = [];

        foreach ($totalStockPurchaseId as $key => $value) {
            $stockPurchaseId = $value;

            $payable_amount = $data['paid_amount'][$stockPurchaseId] ?? 0;
            if ($payable_amount <= 0) {
                continue;
            }
            $stockPurchase = StockPurchase::query()->find($stockPurchaseId);
            if (! $stockPurchase) {
                continue;
            }

            $totalDueAmount = $stockPurchase->total_due;
            if ($totalDueAmount <= 0) {
                continue;
            }

            DB::beginTransaction();
            $attachments = empty($data['attachment']) ?
                [] : Arr::map($data['attachment'], function (string $value) {
                    return getRelativeUrl($value);
                });
            $stockPurchasePayment = new StockPurchasePayment;
            $stockPurchasePayment->stock_purchase_id = $stockPurchaseId;
            $stockPurchasePayment->payment_date = $data['payment_date'];
            $stockPurchasePayment->amount = $payable_amount;
            $stockPurchasePayment->bank_account_id = $data['bank_account_id'];
            $stockPurchasePayment->voucher_number = generateVoucherNumber(VoucherType::GENERAL_CASH_OUT->value);
            $stockPurchasePayment->paid_to = $data['paid_to'];
            $stockPurchasePayment->notes = $data['notes'];
            $stockPurchasePayment->attachment = $attachments;
            $stockPurchasePayment->save();

            // stock purchase
            $stockPurchase = $stockPurchase->fresh();

            $stockPurchase->recalculatePaymentStatus();

            DB::commit();

            $paymentArr[] = $stockPurchasePayment->id;
        }

        if (! empty($paymentArr)) {
            StockPurchasePayment::whereIn('id', $paymentArr)->update([
                'group_payment_ids' => $paymentArr,
            ]);

            return redirect()->back()->with([
                'success' => true,
                'message' => 'Stock purchase created successfully.',
                'redirect_url' => '/stock-purchases/multi-payment-receipt?payment_id='.$paymentArr[0],
            ]);
        }

        return response()->json(['success' => false, 'error' => 'Payment fail'], 400);
    }
}
