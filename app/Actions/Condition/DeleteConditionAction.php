<?php

declare(strict_types=1);

namespace App\Actions\Condition;

use App\Models\Condition;

class DeleteConditionAction
{
    public function execute(Condition $condition): bool
    {
        return $condition->delete();
    }
}
