<?php

declare(strict_types=1);

namespace App\Actions\Stock;

use App\Enums\StockStatus;
use App\Models\StockPurchase;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeleteStockPurchaseAction
{
    public function execute(StockPurchase $stockPurchase): void
    {
        if ($stockPurchase->stocks()->where('status', StockStatus::SOLD)->exists()) {
            throw ValidationException::withMessages([
                'stock_purchase' => __('Cannot delete this purchase because some items have already been sold.'),
            ]);
        }

        DB::transaction(function () use ($stockPurchase) {
            $stockPurchase->stocks()->delete();
            $stockPurchase->delete();
        });
    }
}
