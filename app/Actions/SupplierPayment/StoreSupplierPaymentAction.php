<?php

declare(strict_types=1);

namespace App\Actions\SupplierPayment;

use App\Enums\Currency;
use App\Models\StockPurchase;
use App\Models\StockPurchasePayment;
use App\Models\Supplier;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class StoreSupplierPaymentAction
{
    public function execute(array $data): StockPurchasePayment
    {
        DB::beginTransaction();

        $attachments = empty($data['attachment']) ? [] : Arr::map(
            $data['attachment'],
            fn (string $value) => getRelativeUrl($value)
        );

        $supplier = Supplier::find($data['supplier_id']);
        $currency = $supplier?->currency?->value ?? Currency::AED->value;

        $parent = new StockPurchasePayment;
        $parent->is_bulk_payment = true;
        $parent->supplier_id = $data['supplier_id'];
        $parent->currency = $currency;
        $parent->stock_purchase_id = null;
        $parent->amount = $data['amount'];
        $parent->payment_date = $data['payment_date'];
        $parent->bank_account_id = $data['bank_account_id'];
        $parent->paid_to = $data['paid_to'] ?? null;
        $parent->notes = $data['notes'] ?? null;
        $parent->attachment = $attachments;
        $parent->save();

        $lineItems = $data['line_items'] ?? [];

        foreach ($lineItems as $item) {
            $payNow = (float) ($item['pay_now'] ?? 0);
            if (empty($item['stock_purchase_id']) || $payNow <= 0) {
                continue;
            }

            $stockPurchase = StockPurchase::query()->find($item['stock_purchase_id']);
            if (! $stockPurchase || $stockPurchase->total_due <= 0) {
                continue;
            }

            $child = new StockPurchasePayment;
            $child->is_bulk_payment = false;
            $child->parent_id = $parent->id;
            $child->voucher_number = $parent->voucher_number;
            $child->supplier_id = $data['supplier_id'];
            $child->currency = $currency;
            $child->stock_purchase_id = $item['stock_purchase_id'];
            $child->amount = $payNow;
            $child->payment_date = $data['payment_date'];
            $child->bank_account_id = $data['bank_account_id'];
            $child->paid_to = $data['paid_to'] ?? null;
            $child->notes = $data['notes'] ?? null;
            $child->save();

            $stockPurchase->fresh()->recalculatePaymentStatus();
        }

        DB::commit();

        return $parent;
    }
}
