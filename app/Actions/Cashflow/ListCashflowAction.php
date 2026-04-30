<?php

declare(strict_types=1);

namespace App\Actions\Cashflow;

use App\Services\CashflowService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

readonly class ListCashflowAction
{
    public function __construct(
        private CashflowService $cashflowService,
    ) {}

    public function execute(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->cashflowService->getFiltered($filters, $perPage);
    }

    public function all(array $filters = []): Collection
    {
        return $this->cashflowService->getAllFiltered($filters);
    }

    public function query(array $filters = []): Builder
    {
        return $this->cashflowService->getQuery($filters);
    }
}
