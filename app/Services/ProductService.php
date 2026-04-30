<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\StockStatus;
use App\Filters\ExactMatchFilter;
use App\Filters\SearchFilter;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pipeline\Pipeline;

class ProductService extends BaseFilterService
{
    protected string $model = Product::class;

    /**
     * Build the query with filters applied.
     *
     * @param  array<string, mixed>  $filters
     */
    protected function buildQuery(array $filters): Builder
    {
        $query = $this->model::query()
            ->with('brand', 'condition')
            ->withCount(['stocks as available_stock_count' => fn (Builder $q) => $q->where('status', StockStatus::AVAILABLE)]);

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
                    'columns' => ['title', 'model'],
                ],
            ],

            'stock_status' => function (array $filters) {
                $value = $filters['stock_status'] ?? '';
                if ($value === 'in_stock') {
                    return new class
                    {
                        public function handle(Builder $query, \Closure $next): Builder
                        {
                            return $next($query->whereHas('stocks', fn (Builder $q) => $q->where('status', StockStatus::AVAILABLE)));
                        }
                    };
                }
                if ($value === 'out_of_stock') {
                    return new class
                    {
                        public function handle(Builder $query, \Closure $next): Builder
                        {
                            return $next($query->whereDoesntHave('stocks', fn (Builder $q) => $q->where('status', StockStatus::AVAILABLE)));
                        }
                    };
                }

                return null;
            },

            'brand_id' => [
                'filter' => ExactMatchFilter::class,
                'params' => [
                    'column' => 'brand_id',
                    'value' => '$brand_id',
                ],
            ],
        ];
    }
}
