<?php

declare(strict_types=1);

namespace App\Actions\Sale;

use App\Services\SaleService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class ListSalesAction
{
    public function __construct(
        private SaleService $saleService,
    ) {}

    public function execute(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->saleService->getFiltered($filters, $perPage);
    }

    public function all(array $filters = []): Collection
    {
        return $this->saleService->getAllFiltered($filters);
    }

    public function query(array $filters = []): Builder
    {
        return $this->saleService->getQuery($filters);
    }
}
