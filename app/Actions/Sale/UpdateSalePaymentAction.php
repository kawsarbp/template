<?php

declare(strict_types=1);

namespace App\Actions\Sale;

use App\Models\SalePayment;

class UpdateSalePaymentAction
{
    public function execute(SalePayment $payment, array $data): SalePayment
    {
        $payment->update([
            'amount' => $data['amount'],
            'payment_date' => $data['payment_date'],
            'bank_account_id' => $data['bank_account_id'],
            'notes' => $data['notes'] ?? null,
        ]);

        $payment->sale->recalculatePaymentStatus();

        return $payment;
    }
}
