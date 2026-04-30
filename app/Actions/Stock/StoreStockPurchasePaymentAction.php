<?php

declare(strict_types=1);

namespace App\Actions\Stock;

use App\Models\StockPurchase;
use App\Models\StockPurchasePayment;

class StoreStockPurchasePaymentAction
{
    public function execute(StockPurchase $purchase, array $data): StockPurchasePayment
    {
        $payment = $purchase->payments()->create([
            'amount' => $data['amount'],
            'payment_date' => $data['payment_date'],
            'bank_account_id' => $data['bank_account_id'],
            'notes' => $data['notes'] ?? null,
        ]);

        $purchase->recalculatePaymentStatus();

        return $payment;
    }
}
