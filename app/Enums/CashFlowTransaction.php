<?php

namespace App\Enums;

abstract class CashFlowTransaction
{
    const INCOME = 1;

    const EXPENSE = 2;

    const DEPOSIT_ACCOUNT = 1;

    const OTHER_ACCOUNT = 2;

    const TT_CASH_ACCOUNT = 3;
}
