<?php

declare(strict_types=1);

namespace App\Services;

use App\Filters\DateRangeFilter;
use App\Filters\ExactMatchFilter;
use App\Filters\InFilter;
use App\Filters\RelationFilter;
use App\Filters\SearchFilter;
use App\Models\Sale;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pipeline\Pipeline;

class SaleService extends BaseFilterService
{
    protected string $model = Sale::class;

    /**
     * Build the query with filters applied.
     *
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
                    'columns' => ['sale_number', 'customer.name'],
                ],
            ],

            'payment_status' => [
                'filter' => ExactMatchFilter::class,
                'params' => [
                    'column' => 'payment_status',
                    'value' => '$payment_status',
                ],
            ],

            'sale_type' => [
                'filter' => ExactMatchFilter::class,
                'params' => [
                    'column' => 'sale_type',
                    'value' => '$sale_type',
                ],
            ],

            'customer_id' => [
                'filter' => ExactMatchFilter::class,
                'params' => [
                    'column' => 'customer_id',
                    'value' => '$customer_id',
                ],
            ],

            'sale_date' => [
                'filter' => DateRangeFilter::class,
                'params' => [
                    'column' => 'sale_date',
                    'date' => '$sale_date',
                ],
            ],

            'imei' => [
                'filter' => RelationFilter::class,
                'params' => [
                    'relation' => 'items.stock',
                    'column' => 'imei',
                    'value' => '$imei',
                ],
            ],

            'batch_number' => [
                'filter' => RelationFilter::class,
                'params' => [
                    'relation' => 'items.stockPurchase',
                    'column' => 'batch_number',
                    'value' => '$batch_number',
                ],
            ],

            'ids' => [
                'filter' => InFilter::class,
                'params' => [
                    'column' => 'id',
                    'values' => '$ids',
                ],
            ],
        ];
    }
}
