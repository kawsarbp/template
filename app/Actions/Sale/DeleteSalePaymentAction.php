<?php

declare(strict_types=1);

namespace App\Actions\Sale;

use App\Models\SalePayment;

class DeleteSalePaymentAction
{
    public function execute(SalePayment $payment): void
    {
        $sale = $payment->sale;

        $payment->delete();

        $sale->recalculatePaymentStatus();
    }
}
