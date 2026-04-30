<?php

namespace App\Enums;

abstract class AdvancedAccountType
{
    const CASH = 1;

    const BANK_TRANSFER = 2;

    const PENDING = 1;

    const APPROVED = 2;

    const REJECTED = 3;
}
