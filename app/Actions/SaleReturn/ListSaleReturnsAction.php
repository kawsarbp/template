<?php

declare(strict_types=1);

namespace App\Actions\SaleReturn;

use App\Services\SaleReturnService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class ListSaleReturnsAction
{
    public function __construct(
        private SaleReturnService $saleReturnService,
    ) {}

    public function execute(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->saleReturnService->getFiltered($filters, $perPage);
    }

    public function query(array $filters = []): Builder
    {
        return $this->saleReturnService->getQuery($filters);
    }
}
