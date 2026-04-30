<?php

namespace App\Enums;

enum VisibilityStatus: int
{
    case ACTIVE = 1;
    case INACTIVE = 2;

    public function getLabel(): string
    {
        return match ($this) {
            VisibilityStatus::ACTIVE => 'Active',
            VisibilityStatus::INACTIVE => 'Inactive',
        };
    }
}
