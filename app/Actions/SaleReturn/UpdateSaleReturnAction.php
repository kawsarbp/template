<?php

declare(strict_types=1);

namespace App\Actions\SaleReturn;

use App\Enums\StockStatus;
use App\Models\SaleReturn;
use App\Models\SaleReturnItem;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;

class UpdateSaleReturnAction
{
    public function execute(SaleReturn $saleReturn, array $data): SaleReturn
    {
        return DB::transaction(function () use ($saleReturn, $data) {
            $saleReturn->update(collect($data)->except('items')->toArray());

            if (array_key_exists('items', $data)) {
                $newItems = $data['items'];
                $newStockIds = array_column($newItems, 'stock_id');
                $existingItems = $saleReturn->items()->with('stock')->get();
                $existingStockIds = $existingItems->pluck('stock_id')->toArray();

                // Removed items: revert stock back to SOLD
                $removedStockIds = array_diff($existingStockIds, $newStockIds);
                if (! empty($removedStockIds)) {
                    $saleReturn->items()->whereIn('stock_id', $removedStockIds)->delete();
                    Stock::whereIn('id', $removedStockIds)
                        ->update(['status' => StockStatus::SOLD]);
                }

                // Add new items or update existing prices
                foreach ($newItems as $itemData) {
                    $existingItem = $existingItems->firstWhere('stock_id', $itemData['stock_id']);
                    if ($existingItem) {
                        $existingItem->update([
                            'return_price' => $itemData['return_price'],
                            'source_type' => $itemData['source_type'] ?? $existingItem->source_type,
                            'line_number' => $itemData['line_number'] ?? $existingItem->line_number,
                            'stock_purchase_id' => $itemData['stock_purchase_id'] ?? $existingItem->stock_purchase_id,
                        ]);
                    } else {
                        SaleReturnItem::create([
                            'sale_return_id' => $saleReturn->id,
                            'stock_id' => $itemData['stock_id'],
                            'return_price' => $itemData['return_price'],
                            'source_type' => $itemData['source_type'] ?? 'stock',
                            'line_number' => $itemData['line_number'] ?? 1,
                            'stock_purchase_id' => $itemData['stock_purchase_id'] ?? null,
                        ]);
                        Stock::where('id', $itemData['stock_id'])
                            ->update(['status' => StockStatus::AVAILABLE]);
                    }
                }

                $totalAmount = (float) array_sum(array_column($newItems, 'return_price'));
                $discount = (float) ($saleReturn->discount ?? 0);

                $saleReturn->update([
                    'total_units' => count($newItems),
                    'total_amount' => $totalAmount,
                    'total_due' => $totalAmount - $discount,
                ]);
            }

            $saleReturn->recalculatePaymentStatus();

            return $saleReturn->fresh();
        });
    }
}
