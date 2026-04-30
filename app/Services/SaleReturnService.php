<?php

declare(strict_types=1);

namespace App\Services;

use App\Filters\DateRangeFilter;
use App\Filters\ExactMatchFilter;
use App\Filters\SearchFilter;
use App\Models\SaleReturn;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pipeline\Pipeline;

class SaleReturnService extends BaseFilterService
{
    protected string $model = SaleReturn::class;

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function buildQuery(array $filters): Builder
    {
        $query = $this->model::query()->with('customer');

        $pipes = $this->buildFilterPipeline($filters);

        return app(Pipeline::class)
            ->send($query)
            ->through($pipes)
            ->thenReturn();
    }

    /**
     * @return array<string|int, array<string, mixed>|callable>
     */
    protected function filterConfig(): array
    {
        return [
            'search' => [
                'filter' => SearchFilter::class,
                'params' => [
                    'searchTerm' => '$search',
                    'columns' => ['return_number', 'customer.name'],
                ],
            ],

            'payment_status' => [
                'filter' => ExactMatchFilter::class,
                'params' => [
                    'column' => 'payment_status',
                    'value' => '$payment_status',
                ],
            ],

            'customer_id' => [
                'filter' => ExactMatchFilter::class,
                'params' => [
                    'column' => 'customer_id',
                    'value' => '$customer_id',
                ],
            ],

            'return_date' => [
                'filter' => DateRangeFilter::class,
                'params' => [
                    'column' => 'return_date',
                    'date' => '$return_date',
                ],
            ],
        ];
    }
}
