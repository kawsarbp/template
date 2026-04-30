<?php

namespace App\Enums;

enum ConditionEnum: int
{
    case EXCELLENT = 1;
    case VERY_GOOD = 2;
    case GOOD = 3;
    case FAIR = 4;
    case POOR = 5;

    public function getLabel(): string
    {
        return match ($this) {
            ConditionEnum::EXCELLENT => 'Excellent',
            ConditionEnum::VERY_GOOD => 'Very Good',
            ConditionEnum::GOOD => 'Good',
            ConditionEnum::FAIR => 'Fair',
            ConditionEnum::POOR => 'Poor',
        };
    }
}
