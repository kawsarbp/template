<?php

declare(strict_types=1);

namespace App\Actions\Stock;

use App\Enums\Currency;
use App\Models\Sale;
use App\Models\StockPurchase;
use App\Models\Supplier;
use App\Services\StockPurchaseService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;

class ListStockPurchasesAction
{
    public function __construct(
        private StockPurchaseService $stockPurchaseService,
    ) {}

    public function execute(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->stockPurchaseService->getFiltered($filters, $perPage);
    }

    public function all(array $filters = []): Collection
    {
        return $this->stockPurchaseService->getAllFiltered($filters);
    }

    public function query(array $filters = []): Builder
    {
        return $this->stockPurchaseService->getQuery($filters);
    }

    public function stockPurchaseSummary(array $filters = []): array
    {
        $currency = ! empty($filters['supplier_id'])
            ? (Supplier::find($filters['supplier_id'])?->currency?->value ?? Currency::AED->value)
            : Currency::AED->value;

        $stockPurchases = StockPurchase::query()
            ->when(! empty($filters['supplier_id']), function (Builder $query) use ($filters) {
                $query->where('supplier_id', $filters['supplier_id']);
            });

        return [
            ['title' => 'Total Amount', 'total_amount' => priceFormat((float) $stockPurchases->sum('total_amount'), 2, $currency)],
            ['title' => 'Total Paid', 'total_paid' => priceFormat((float) $stockPurchases->sum('total_paid'), 2, $currency)],
            ['title' => 'Total Due', 'total_due' => priceFormat((float) $stockPurchases->sum('total_due'), 2, $currency)],
        ];
    }

    public function monthlyReport(): JsonResponse
    {
        $start = now()->subMonths(11)->startOfMonth();
        $end = now()->endOfMonth();

        $sales = Sale::whereBetween('sale_date', [$start, $end])
            ->selectRaw('DATE_FORMAT(sale_date, "%Y-%m") as month, ROUND(SUM(total_amount), 0) as total')
            ->groupBy('month')
            ->pluck('total', 'month')
            ->toArray();

        $purchases = StockPurchase::whereBetween('purchase_date', [$start, $end])
            ->selectRaw('DATE_FORMAT(purchase_date, "%Y-%m") as month, ROUND(SUM(total_amount), 0) as total')
            ->groupBy('month')
            ->pluck('total', 'month')
            ->toArray();

        $data = [];

        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $key = $date->format('Y-m');

            $data[] = [
                'month' => $date->format('M y'),
                'sales' => $sales[$key] ?? 0,
                'purchases' => $purchases[$key] ?? 0,
            ];
        }

        return response()->json($data);
    }
}
