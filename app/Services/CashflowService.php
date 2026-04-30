<?php

declare(strict_types=1);

namespace App\Services;

use App\Filters\ExactMatchFilter;
use App\Filters\SearchFilter;
use App\Models\CashflowTransaction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pipeline\Pipeline;

class CashflowService extends BaseFilterService
{
    protected string $model = CashflowTransaction::class;

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
                    'columns' => ['name', 'voucher_number', 'description'],
                ],
            ],
            'type' => [
                'filter' => ExactMatchFilter::class,
                'params' => [
                    'column' => 'type',
                    'value' => '$type',
                ],
            ],
            'bank_account_id' => [
                'filter' => ExactMatchFilter::class,
                'params' => [
                    'column' => 'bank_account_id',
                    'value' => '$bank_account_id',
                ],
            ],
        ];
    }
}
