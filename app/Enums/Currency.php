<?php

declare(strict_types=1);

namespace App\Enums;

enum Currency: string
{
    case AED = 'AED';
    case HKD = 'HKD';

    public function getLabel(): string
    {
        return $this->value;
    }
}
