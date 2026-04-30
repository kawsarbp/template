<?php

declare(strict_types=1);

namespace App\Actions\SupplierPayment;

use App\Models\StockPurchasePayment;
use Illuminate\Support\Facades\DB;

class DeleteSupplierPaymentAction
{
    public function execute(StockPurchasePayment $payment): void
    {
        DB::beginTransaction();

        $payment->children()
            ->with('stockPurchase')
            ->get()
            ->each(function (StockPurchasePayment $child): void {
                $purchase = $child->stockPurchase;
                $child->delete();
                $purchase?->recalculatePaymentStatus();
            });

        $payment->delete();

        DB::commit();
    }
}
