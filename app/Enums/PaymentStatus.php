<?php

namespace App\Enums;

enum PaymentStatus: int
{
    case PAID = 1;
    case PARTIAL = 2;
    case UNPAID = 3;

    public function getLabel(): string
    {
        return match ($this) {
            PaymentStatus::PAID => 'Paid',
            PaymentStatus::PARTIAL => 'Partial',
            PaymentStatus::UNPAID => 'Unpaid',
        };
    }
}
