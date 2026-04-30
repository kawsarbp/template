<?php

declare(strict_types=1);

namespace App\Actions\SaleReturn;

use App\Enums\StockStatus;
use App\Models\SaleReturn;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeleteSaleReturnAction
{
    public function execute(SaleReturn $saleReturn): void
    {
        if ($saleReturn->payments()->exists()) {
            throw ValidationException::withMessages([
                'sale_return' => __('Cannot delete this return because it has refund payments recorded. Delete the payments first.'),
            ]);
        }

        DB::transaction(function () use ($saleReturn) {
            $stockIds = $saleReturn->items()->pluck('stock_id');

            Stock::whereIn('id', $stockIds)
                ->update(['status' => StockStatus::SOLD]);

            $saleReturn->items()->delete();
            $saleReturn->delete();
        });
    }
}
