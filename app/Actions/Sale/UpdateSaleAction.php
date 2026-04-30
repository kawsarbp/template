<?php

declare(strict_types=1);

namespace App\Actions\Sale;

use App\Enums\StockStatus;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;

class UpdateSaleAction
{
    public function execute(Sale $sale, array $data): Sale
    {
        return DB::transaction(function () use ($sale, $data) {
            // Update sale metadata (exclude items from direct update)
            $saleFields = collect($data)->except('items')->toArray();
            $sale->update($saleFields);

            // Sync items if provided
            if (array_key_exists('items', $data)) {
                $newItems = $data['items'];
                $newStockIds = array_column($newItems, 'stock_id');
                $existingItems = $sale->items()->with('stock')->get();
                $existingStockIds = $existingItems->pluck('stock_id')->toArray();

                // Remove items no longer in the list
                $removedStockIds = array_diff($existingStockIds, $newStockIds);
                if (! empty($removedStockIds)) {
                    $sale->items()->whereIn('stock_id', $removedStockIds)->delete();
                    Stock::whereIn('id', $removedStockIds)
                        ->update(['status' => StockStatus::AVAILABLE]);
                }

                // Add new items & update existing sale prices
                foreach ($newItems as $itemData) {
                    $existingItem = $existingItems->firstWhere('stock_id', $itemData['stock_id']);
                    if ($existingItem) {
                        $existingItem->update([
                            'sale_price' => $itemData['sale_price'],
                            'source_type' => $itemData['source_type'] ?? $existingItem->source_type,
                            'line_number' => $itemData['line_number'] ?? $existingItem->line_number,
                            'stock_purchase_id' => $itemData['stock_purchase_id'] ?? $existingItem->stock_purchase_id,
                        ]);
                    } else {
                        SaleItem::create([
                            'sale_id' => $sale->id,
                            'stock_id' => $itemData['stock_id'],
                            'sale_price' => $itemData['sale_price'],
                            'source_type' => $itemData['source_type'] ?? 'stock',
                            'line_number' => $itemData['line_number'] ?? 1,
                            'stock_purchase_id' => $itemData['stock_purchase_id'] ?? null,
                        ]);
                        Stock::where('id', $itemData['stock_id'])
                            ->update(['status' => StockStatus::SOLD]);
                    }
                }

                // Recalculate totals
                $totalAmount = array_sum(array_column($newItems, 'sale_price'));
                $discount = (float) ($sale->discount ?? 0);

                $sale->update([
                    'total_units' => count($newItems),
                    'total_amount' => $totalAmount,
                ]);
            }

            $sale->recalculatePaymentStatus();

            return $sale->fresh();
        });
    }
}
