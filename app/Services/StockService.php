<?php

declare(strict_types=1);

namespace App\Services;

use App\Filters\ExactMatchFilter;
use App\Filters\SearchFilter;
use App\Models\Stock;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pipeline\Pipeline;

class StockService extends BaseFilterService
{
    protected string $model = Stock::class;

    /**
     * Build the query with filters applied.
     *
     * @param  array<string, mixed>  $filters
     */
    protected function buildQuery(array $filters): Builder
    {
        $query = $this->model::query()->with(['product.brand', 'condition','stockPurchaseItem.stockPurchase']);

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
                    'columns' => ['imei', 'product.title'],
                ],
            ],

            'status' => [
                'filter' => ExactMatchFilter::class,
                'params' => [
                    'column' => 'status',
                    'value' => '$status',
                ],
            ],

            'condition_id' => [
                'filter' => ExactMatchFilter::class,
                'params' => [
                    'column' => 'condition_id',
                    'value' => '$condition_id',
                ],
            ],

            'product_id' => [
                'filter' => ExactMatchFilter::class,
                'params' => [
                    'column' => 'product_id',
                    'value' => '$product_id',
                ],
            ],
        ];
    }
}
