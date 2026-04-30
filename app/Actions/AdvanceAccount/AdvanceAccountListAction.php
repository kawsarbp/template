<?php

declare(strict_types=1);

namespace App\Actions\AdvanceAccount;

use App\Services\AdvanceAccountListService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class AdvanceAccountListAction
{
    public function __construct(
        private AdvanceAccountListService $advanceAccountListService,
    ) {}

    public function execute(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->advanceAccountListService->getFiltered($filters, $perPage);
    }

    public function all(array $filters = []): Collection
    {
        return $this->advanceAccountListService->getAllFiltered($filters);
    }

    public function query(array $filters = []): Builder
    {
        return $this->advanceAccountListService->getQuery($filters);
    }
}
