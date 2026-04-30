<?php

declare(strict_types=1);

namespace App\Actions\Sale;

use App\Enums\StockStatus;
use App\Models\Sale;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeleteSaleAction
{
    public function execute(Sale $sale): void
    {
        if ($sale->payments()->exists()) {
            throw ValidationException::withMessages([
                'sale' => __('Cannot delete this sale because it has payments recorded. Delete the payments first.'),
            ]);
        }

        DB::transaction(function () use ($sale) {
            $stockIds = $sale->items()->pluck('stock_id');

            Stock::whereIn('id', $stockIds)
                ->update(['status' => StockStatus::AVAILABLE]);

            $sale->items()->delete();
            $sale->delete();
        });
    }
}
