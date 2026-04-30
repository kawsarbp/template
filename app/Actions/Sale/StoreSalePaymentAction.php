<?php

declare(strict_types=1);

namespace App\Actions\Sale;

use App\Models\Sale;
use App\Models\SalePayment;

class StoreSalePaymentAction
{
    public function execute(Sale $sale, array $data): SalePayment
    {
        $payment = $sale->payments()->create([
            'amount' => $data['amount'],
            'payment_date' => $data['payment_date'],
            'bank_account_id' => $data['bank_account_id'],
            'notes' => $data['notes'] ?? null,
        ]);

        $sale->recalculatePaymentStatus();

        return $payment;
    }
}
