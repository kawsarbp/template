<?php

declare(strict_types=1);

namespace App\Actions\Cashflow;

use App\Models\CashflowTransaction;

class DeleteCashflowAction
{
    public function execute(CashflowTransaction $cashflowTransaction)
    {
        $cashflowTransaction->firstOrFail();

        $cashflowTransaction->delete();
    }
}
