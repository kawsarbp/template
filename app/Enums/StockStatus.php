<?php

namespace App\Enums;

enum StockStatus: int
{
    case AVAILABLE = 1;
    case SOLD = 2;
    case RETURNED = 3;
    case DEFECTIVE = 4;

    public function getLabel(): string
    {
        return match ($this) {
            StockStatus::AVAILABLE => 'Available',
            StockStatus::SOLD => 'Sold',
            StockStatus::RETURNED => 'Returned',
            StockStatus::DEFECTIVE => 'Defective',
        };
    }
}
