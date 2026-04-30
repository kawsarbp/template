<?php

declare(strict_types=1);

namespace App\Actions\Product;

use App\Services\ProductService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

readonly class ListProductsAction
{
    public function __construct(
        private ProductService $productService,
    ) {}

    public function execute(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->productService->getFiltered($filters, $perPage);
    }

    public function all(array $filters = []): Collection
    {
        return $this->productService->getAllFiltered($filters);
    }

    public function query(array $filters = []): Builder
    {
        return $this->productService->getQuery($filters);
    }
}
