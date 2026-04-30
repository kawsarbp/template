<?php

namespace App\Enums;

enum BooleanStatus: int
{
    case YES = 1;
    case NO = 2;

    public function getLabel(): string
    {
        return match ($this) {
            BooleanStatus::YES => 'Yes',
            BooleanStatus::NO => 'No'
        };
    }
}
