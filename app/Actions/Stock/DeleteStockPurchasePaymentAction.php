<?php

declare(strict_types=1);

namespace App\Actions\Stock;

use App\Models\StockPurchasePayment;

class DeleteStockPurchasePaymentAction
{
    public function execute(StockPurchasePayment $payment): StockPurchasePayment
    {
        $purchase = $payment->stockPurchase;

        $payment->delete();

        $purchase->recalculatePaymentStatus();

        return $payment;
    }
}
