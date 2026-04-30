<?php

declare(strict_types=1);

namespace App\Actions\Stock;

use App\Enums\Currency;
use App\Enums\StockStatus;
use App\Models\Stock;
use App\Models\StockPurchase;
use App\Models\StockPurchaseItem;
use App\Models\Supplier;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class StoreStockPurchaseAction
{
    public function execute(array $data): StockPurchase
    {
        return DB::transaction(function () use ($data) {
            $totalUnits = 0;
            $totalAmount = 0;

            foreach ($data['items'] as $item) {
                $totalUnits += $item['quantity'];
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            $discount = (float) ($data['discount'] ?? 0);
            $totalDue = $totalAmount - $discount;

            $data['attachment'] = empty($data['attachment']) ?
                [] : Arr::map($data['attachment'], function (string $value) {
                    return getRelativeUrl($value);
                });

            $supplier = Supplier::find($data['supplier_id'] ?? null);
            $currency = $supplier?->currency?->value ?? Currency::AED->value;
            $exchangeRate = $currency === Currency::HKD->value ? (float) ($data['exchange_rate'] ?? 0) : null;

            $purchase = StockPurchase::create([
                'batch_number' => $data['batch_number'] ?? null,
                'supplier_id' => $data['supplier_id'] ?? null,
                'currency' => $currency,
                'exchange_rate' => $exchangeRate,
                'purchase_date' => $data['purchase_date'],
                'notes' => $data['notes'] ?? null,
                'attachment' => $data['attachment'],
                'total_units' => $totalUnits,
                'total_amount' => $totalAmount,
                'discount' => $discount,
                'total_due' => $totalDue,
            ]);

            foreach ($data['items'] as $itemData) {
                $purchaseItem = StockPurchaseItem::create([
                    'stock_purchase_id' => $purchase->id,
                    'product_id' => $itemData['product_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'condition_id' => $itemData['condition_id'],
                ]);

                $imeis = $itemData['imeis'] ?? [];

                for ($i = 0; $i < $itemData['quantity']; $i++) {
                    Stock::create([
                        'stock_purchase_item_id' => $purchaseItem->id,
                        'product_id' => $itemData['product_id'],
                        'imei' => $imeis[$i] ?? null,
                        'condition_id' => $itemData['condition_id'],
                        'purchase_price' => $itemData['unit_price'],
                        'sale_price' => $itemData['sale_price'] ?? null,
                        'status' => StockStatus::AVAILABLE,
                    ]);
                }
            }

            return $purchase->load(['items.product', 'stocks']);
        });
    }
}
