<?php

declare(strict_types=1);

namespace App\Actions\Stock;

use App\Services\StockService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

readonly class ListStocksAction
{
    public function __construct(
        private StockService $stockService,
    ) {}

    public function execute(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->stockService->getFiltered($filters, $perPage);
    }

    public function all(array $filters = []): Collection
    {
        return $this->stockService->getAllFiltered($filters);
    }

    public function query(array $filters = []): Builder
    {
        return $this->stockService->getQuery($filters);
    }
}
