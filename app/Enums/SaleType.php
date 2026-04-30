<?php

namespace App\Enums;

enum SaleType: int
{
    case Bulk = 1;
    case Retail = 2;

    public function getLabel(): string
    {
        return match ($this) {
            SaleType::Bulk => 'Bulk',
            SaleType::Retail => 'Retail',
        };
    }
}
