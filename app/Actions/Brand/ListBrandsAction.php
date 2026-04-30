<?php

declare(strict_types=1);

namespace App\Actions\Brand;

use App\Services\BrandService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

readonly class ListBrandsAction
{
    public function __construct(
        private BrandService $brandService,
    ) {}

    public function execute(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->brandService->getFiltered($filters, $perPage);
    }

    public function all(array $filters = []): Collection
    {
        return $this->brandService->getAllFiltered($filters);
    }

    public function query(array $filters = []): Builder
    {
        return $this->brandService->getQuery($filters);
    }
}
