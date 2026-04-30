<?php

declare(strict_types=1);

namespace App\Services;

use App\Filters\ExactMatchFilter;
use App\Filters\SearchFilter;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pipeline\Pipeline;

class CustomerService extends BaseFilterService
{
    protected string $model = Customer::class;

    /**
     * Build the query with filters applied.
     *
     * @param  array<string, mixed>  $filters
     */
    protected function buildQuery(array $filters): Builder
    {
        $query = $this->model::query();

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
                    'columns' => ['name', 'email'],
                ],
            ],

            'status' => [
                'filter' => ExactMatchFilter::class,
                'params' => [
                    'column' => 'status',
                    'value' => '$status',
                ],
            ],
        ];
    }
}
