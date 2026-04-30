<?php

declare(strict_types=1);

namespace App\Actions\SaleReturn;

use App\Models\SaleReturn;
use App\Models\SaleReturnPayment;

class StoreSaleReturnPaymentAction
{
    public function execute(SaleReturn $saleReturn, array $data): SaleReturnPayment
    {
        $payment = $saleReturn->payments()->create([
            'amount' => $data['amount'],
            'payment_date' => $data['payment_date'],
            'bank_account_id' => $data['bank_account_id'],
            'notes' => $data['notes'] ?? null,
        ]);

        $saleReturn->recalculatePaymentStatus();

        return $payment;
    }
}
