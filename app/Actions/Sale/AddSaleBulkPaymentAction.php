<?php

declare(strict_types=1);

namespace App\Actions\Sale;

use App\Enums\VoucherType;
use App\Models\Sale;
use App\Models\SalePayment;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AddSaleBulkPaymentAction
{
    public function execute(array $data)
    {
        $totalSaleId = $data['sale_ids'];
        $paymentArr = [];

        foreach ($totalSaleId as $key => $value) {
            $saleId = $value;

            $payable_amount = $data['paid_amount'][$saleId] ?? 0;
            if ($payable_amount <= 0) {
                continue;
            }
            $sale = Sale::query()->find($saleId);
            if (! $sale) {
                continue;
            }

            $totalDueAmount = $sale->total_due;
            if ($totalDueAmount <= 0) {
                continue;
            }

            DB::beginTransaction();
            $attachments = empty($data['attachment']) ?
                [] : Arr::map($data['attachment'], function (string $value) {
                    return getRelativeUrl($value);
                });
            $salePayment = new SalePayment;
            $salePayment->sale_id = $saleId;
            $salePayment->payment_date = $data['payment_date'];
            $salePayment->amount = $payable_amount;
            $salePayment->bank_account_id = $data['bank_account_id'];
            $salePayment->voucher_number = generateVoucherNumber(VoucherType::GENERAL_CASH_IN->value);
            $salePayment->received_from = $data['received_from'];
            $salePayment->notes = $data['notes'];
            $salePayment->attachment = $attachments;
            $salePayment->save();

            // sale purchase
            $sale = $sale->fresh();
            $sale->recalculatePaymentStatus();

            DB::commit();

            $paymentArr[] = $salePayment->id;
        }

        if (! empty($paymentArr)) {
            SalePayment::whereIn('id', $paymentArr)->update([
                'group_payment_ids' => $paymentArr,
            ]);

            return redirect()->back()->with([
                'success' => true,
                'message' => 'Sale created successfully.',
                'redirect_url' => '/sales/multi-payment-receipt?payment_id='.$paymentArr[0],
            ]);
        }

        return response()->json(['success' => false, 'error' => 'Payment fail.'], 400);
    }
}
