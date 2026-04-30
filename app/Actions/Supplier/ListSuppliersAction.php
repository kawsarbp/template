<?php

declare(strict_types=1);

namespace App\Actions\Supplier;

use App\Services\SupplierService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

readonly class ListSuppliersAction
{
    public function __construct(
        private SupplierService $supplierService,
    ) {}

    public function execute(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->supplierService->getFiltered($filters, $perPage);
    }

    public function all(array $filters = []): Collection
    {
        return $this->supplierService->getAllFiltered($filters);
    }

    public function query(array $filters = []): Builder
    {
        return $this->supplierService->getQuery($filters);
    }
}
