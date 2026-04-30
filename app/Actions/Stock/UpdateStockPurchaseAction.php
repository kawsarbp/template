<?php

declare(strict_types=1);

namespace App\Actions\Stock;

use App\Enums\Currency;
use App\Models\StockPurchase;
use App\Models\Supplier;
use Illuminate\Support\Arr;

class UpdateStockPurchaseAction
{
    public function execute(StockPurchase $stockPurchase, array $data): StockPurchase
    {
        $data['attachment'] = empty($data['attachment']) ?
            [] : Arr::map($data['attachment'], function (string $value) {
                return getRelativeUrl($value);
            });

        $supplier = Supplier::find($data['supplier_id'] ?? $stockPurchase->supplier_id);
        $currency = $supplier?->currency?->value ?? Currency::AED->value;
        $data['currency'] = $currency;
        $data['exchange_rate'] = $currency === Currency::HKD->value ? (float) ($data['exchange_rate'] ?? 0) : null;

        $stockPurchase->update($data);

        if (array_key_exists('discount', $data)) {
            $stockPurchase->recalculatePaymentStatus();
        }

        return $stockPurchase->fresh();
    }
}
