<?php

declare(strict_types=1);

namespace App\Actions\SupplierPayment;

use App\Models\StockPurchase;
use App\Models\StockPurchasePayment;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class UpdateSupplierPaymentAction
{
    public function execute(StockPurchasePayment $payment, array $data): StockPurchasePayment
    {
        DB::beginTransaction();

        $attachments = empty($data['attachment']) ? [] : Arr::map(
            $data['attachment'],
            fn (string $value) => getRelativeUrl($value)
        );

        $payment->update([
            'amount' => $data['amount'],
            'payment_date' => $data['payment_date'],
            'bank_account_id' => $data['bank_account_id'],
            'paid_to' => $data['paid_to'] ?? null,
            'notes' => $data['notes'] ?? null,
            'attachment' => $attachments,
        ]);

        $incomingLineItems = collect($data['line_items'] ?? []);
        $incomingIds = $incomingLineItems->pluck('id')->filter()->values();

        // Delete removed children and recalculate their stock purchases
        $payment->children()
            ->with('stockPurchase')
            ->whereNotIn('id', $incomingIds)
            ->get()
            ->each(function (StockPurchasePayment $child): void {
                $purchase = $child->stockPurchase;
                $child->delete();
                $purchase?->recalculatePaymentStatus();
            });

        foreach ($incomingLineItems as $item) {
            $payNow = (float) ($item['pay_now'] ?? 0);
            if ($payNow <= 0) {
                continue;
            }

            if (! empty($item['id'])) {
                // Update existing child
                $child = StockPurchasePayment::query()->with('stockPurchase')->find($item['id']);
                if ($child) {
                    $child->update([
                        'amount' => $payNow,
                        'payment_date' => $data['payment_date'],
                        'bank_account_id' => $data['bank_account_id'],
                        'paid_to' => $data['paid_to'] ?? null,
                    ]);
                    $child->stockPurchase?->recalculatePaymentStatus();
                }
            } else {
                // New child
                $stockPurchase = StockPurchase::query()->find($item['stock_purchase_id'] ?? null);
                if (! $stockPurchase || $stockPurchase->total_due <= 0) {
                    continue;
                }

                $child = new StockPurchasePayment;
                $child->is_bulk_payment = false;
                $child->parent_id = $payment->id;
                $child->supplier_id = $payment->supplier_id;
                $child->currency = $payment->currency;
                $child->stock_purchase_id = $item['stock_purchase_id'];
                $child->amount = $payNow;
                $child->payment_date = $data['payment_date'];
                $child->bank_account_id = $data['bank_account_id'];
                $child->paid_to = $data['paid_to'] ?? null;
                $child->save();

                $stockPurchase->fresh()->recalculatePaymentStatus();
            }
        }

        DB::commit();

        return $payment->fresh();
    }
}
