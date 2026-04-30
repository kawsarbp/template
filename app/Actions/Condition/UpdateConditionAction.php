<?php

declare(strict_types=1);

namespace App\Actions\Condition;

use App\Http\Resources\Condition\ConditionDetailResource;
use App\Models\Condition;

class UpdateConditionAction
{
    public function execute(Condition $condition, array $data): ConditionDetailResource
    {
        $condition->update($data);

        return new ConditionDetailResource($condition);
    }
}
