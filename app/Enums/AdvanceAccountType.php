<?php

namespace App\Enums;

enum AdvanceAccountType: int
{
    case DEPOSIT = 1;
    case WITHDRAW = 2;

    public function getLabel(): string
    {
        return match ($this) {
            AdvanceAccountType::DEPOSIT => 'Deposit',
            AdvanceAccountType::WITHDRAW => 'Withdraw',
        };
    }
}
