<?php

declare(strict_types=1);

namespace App\Actions\Condition;

use App\Services\ConditionService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class ListConditionsAction
{
    public function __construct(
        private ConditionService $conditionService,
    ) {}

    public function execute(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->conditionService->getFiltered($filters, $perPage);
    }

    public function all(array $filters = []): Collection
    {
        return $this->conditionService->getAllFiltered($filters);
    }

    public function query(array $filters = []): Builder
    {
        return $this->conditionService->getQuery($filters);
    }
}
