<?php

namespace App\Enums;

enum ProductStatus: int
{
    case IN_STOCK = 1;
    case SOLD = 2;
    case RESERVED = 3;
    case PENDING_INSPECTION = 4;
    case REFURBISHING = 5;

    public function getLabel(): string
    {
        return match ($this) {
            ProductStatus::IN_STOCK => 'In Stock',
            ProductStatus::SOLD => 'Sold',
            ProductStatus::RESERVED => 'Reserved',
            ProductStatus::PENDING_INSPECTION => 'Pending Inspection',
            ProductStatus::REFURBISHING => 'Refurbishing',
        };
    }
}
