<?php

declare(strict_types=1);

namespace App\Services;

use App\Filters\ExactMatchFilter;
use App\Models\AdvancedAccount;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pipeline\Pipeline;

class AdvanceAccountListService extends BaseFilterService
{
    protected string $model = AdvancedAccount::class;

    /**
     * Build the query with filters applied.
     *
     * @param  array<string, mixed>  $filters
     */
    protected function buildQuery(array $filters): Builder
    {
        $query = $this->model::query()->with(['bank_account', 'customer']);

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
                    'column' => 'customer_id',
                    'value' => '$customer_id',
                ],
            ],
        ];
    }
}
