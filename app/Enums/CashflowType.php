<?php

namespace App\Enums;

enum CashflowType: int
{
    case CASH_IN = 1;
    case CASH_OUT = 2;

    public function getLabel(): string
    {
        return match ($this) {
            CashflowType::CASH_IN => 'Cash In',
            CashflowType::CASH_OUT => 'Cash Out',
        };
    }
}
