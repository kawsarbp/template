<?php

declare(strict_types=1);

namespace App\Services;

use App\Filters\ExactMatchFilter;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pipeline\Pipeline;

class AdvanceAccountService extends BaseFilterService
{
    protected string $model = Customer::class;

    /**
     * Build the query with filters applied.
     *
     * @param  array<string, mixed>  $filters
     */
    protected function buildQuery(array $filters): Builder
    {
        $query = $this->model::query()->whereHas('advance_payments');

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
            'customer_id' => [
                'filter' => ExactMatchFilter::class,
                'params' => [
                    'column' => 'id',
                    'value' => '$customer_id',
                ],
            ],
        ];
    }
}
