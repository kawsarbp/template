<?php

declare(strict_types=1);

namespace App\Services;

use App\Filters\DateRangeFilter;
use App\Filters\ExactMatchFilter;
use App\Filters\SearchFilter;
use App\Models\StockPurchasePayment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pipeline\Pipeline;

class SupplierPaymentService extends BaseFilterService
{
    protected string $model = StockPurchasePayment::class;

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function buildQuery(array $filters): Builder
    {
        $query = $this->model::query()
            ->with(['supplier', 'bankAccount', 'children.stockPurchase'])
            ->withCount('children')
            ->withSum('children', 'amount')
            ->where('is_bulk_payment', true)
            ->whereNull('parent_id');

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
            'supplier_id' => [
                'filter' => ExactMatchFilter::class,
                'params' => [
                    'column' => 'supplier_id',
                    'value' => '$supplier_id',
                ],
            ],
            'payment_date' => [
                'filter' => DateRangeFilter::class,
                'params' => [
                    'column' => 'payment_date',
                    'date' => '$payment_date',
                ],
            ],
            'search' => [
                'filter' => SearchFilter::class,
                'params' => [
                    'searchTerm' => '$search',
                    'columns' => ['voucher_number', 'paid_to', 'children.stockPurchase.batch_number'],
                ],
            ],
        ];
    }
}
