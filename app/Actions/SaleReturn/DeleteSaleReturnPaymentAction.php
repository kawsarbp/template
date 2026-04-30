<?php

declare(strict_types=1);

namespace App\Actions\SaleReturn;

use App\Models\SaleReturnPayment;

class DeleteSaleReturnPaymentAction
{
    public function execute(SaleReturnPayment $payment): void
    {
        $saleReturn = $payment->saleReturn;
        $payment->delete();
        $saleReturn->recalculatePaymentStatus();
    }
}
