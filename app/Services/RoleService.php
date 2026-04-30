<?php

declare(strict_types=1);

namespace App\Services;

use App\Filters\SearchFilter;
use App\Filters\SortFilter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pipeline\Pipeline;
use Spatie\Permission\Models\Role;

class RoleService extends BaseFilterService
{
    protected string $model = Role::class;

    /**
     * Build the query with filters applied.
     *
     * @param  array<string, mixed>  $filters
     */
    protected function buildQuery(array $filters): Builder
    {
        $query = $this->model::query()->with('permissions');

        $pipes = $this->buildFilterPipeline($filters);

        return app(Pipeline::class)
            ->send($query)
            ->through($pipes)
            ->thenReturn();
    }

    /**
     * Define the filter configuration.
     *
     * @return array<string|int, array<string, mixed>|callable>
     */
    protected function filterConfig(): array
    {
        return [
            'search' => [
                'filter' => SearchFilter::class,
                'params' => [
                    'searchTerm' => '$search',
                    'columns' => ['name'],
                ],
            ],

            'sort_by' => [
                'filter' => SortFilter::class,
                'params' => [
                    'column' => '$sort_by',
                    'direction' => fn ($filters) => $filters['sort_direction'] ?? 'asc',
                ],
            ],
        ];
    }
}
