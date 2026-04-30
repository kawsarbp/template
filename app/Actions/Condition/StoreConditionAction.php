<?php

declare(strict_types=1);

namespace App\Actions\Condition;

use App\Models\Condition;

class StoreConditionAction
{
    public function execute(array $data): Condition
    {
        return Condition::create($data);
    }
}
