<?php

declare(strict_types=1);

namespace App\Services;

use App\Filters\DateRangeFilter;
use App\Filters\ExactMatchFilter;
use App\Filters\InFilter;
use App\Filters\SearchFilter;
use App\Models\StockPurchase;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pipeline\Pipeline;

class StockPurchaseService extends BaseFilterService
{
    protected string $model = StockPurchase::class;

    /**
     * Build the query with filters applied.
     *
     * @param  array<string, mixed>  $filters
     */
    protected function buildQuery(array $filters): Builder
    {
        $query = $this->model::query()->with('supplier');

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
                    'columns' => ['batch_number', 'supplier.name'],
                ],
            ],

            'payment_status' => [
                'filter' => ExactMatchFilter::class,
                'params' => [
                    'column' => 'payment_status',
                    'value' => '$payment_status',
                ],
            ],

            'supplier_id' => [
                'filter' => ExactMatchFilter::class,
                'params' => [
                    'column' => 'supplier_id',
                    'value' => '$supplier_id',
                ],
            ],

            'purchase_date' => [
                'filter' => DateRangeFilter::class,
                'params' => [
                    'column' => 'purchase_date',
                    'date' => '$purchase_date',
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
