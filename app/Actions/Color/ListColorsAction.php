<?php

declare(strict_types=1);

namespace App\Actions\Color;

use App\Services\ColorService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class ListColorsAction
{
    public function __construct(
        private ColorService $colorService,
    ) {}

    public function execute(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->colorService->getFiltered($filters, $perPage);
    }

    public function all(array $filters = []): Collection
    {
        return $this->colorService->getAllFiltered($filters);
    }

    public function query(array $filters = []): Builder
    {
        return $this->colorService->getQuery($filters);
    }
}
