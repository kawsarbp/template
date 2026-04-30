<?php

declare(strict_types=1);

namespace App\Actions\Stock;

use App\Models\StockPurchasePayment;

class UpdateStockPurchasePaymentAction
{
    public function execute(StockPurchasePayment $payment, array $data): StockPurchasePayment
    {
        $payment->update([
            'amount' => $data['amount'],
            'payment_date' => $data['payment_date'],
            'bank_account_id' => $data['bank_account_id'],
            'notes' => $data['notes'] ?? null,
        ]);

        $payment->stockPurchase->recalculatePaymentStatus();

        return $payment;
    }
}
