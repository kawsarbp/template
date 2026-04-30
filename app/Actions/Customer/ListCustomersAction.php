<?php

declare(strict_types=1);

namespace App\Actions\Customer;

use App\Services\CustomerService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

readonly class ListCustomersAction
{
    public function __construct(
        private CustomerService $customerService,
    ) {}

    public function execute(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->customerService->getFiltered($filters, $perPage);
    }

    public function all(array $filters = []): Collection
    {
        return $this->customerService->getAllFiltered($filters);
    }

    public function query(array $filters = []): Builder
    {
        return $this->customerService->getQuery($filters);
    }

    /**
     * @return array{total_credit_sum: float, utilized_credit_sum: float, current_credit_sum: float}
     */
    public function summary(array $filters = []): array
    {
        $customerIds = $this->query($filters)->pluck('customer_id');

        $totals = CustomerDiscount::query()
            ->whereIn('customer_id', $customerIds)
            ->whereNull('deleted_at')
            ->selectRaw('
                COALESCE(SUM(CASE WHEN discount > 0 THEN discount ELSE 0 END), 0) as total_credit,
                COALESCE(SUM(CASE WHEN discount < 0 THEN ABS(discount) ELSE 0 END), 0) as utilized_credit,
                COALESCE(SUM(discount), 0) as current_credit
            ')
            ->first();

        return [
            'total_credit_sum' => (float) $totals->total_credit,
            'utilized_credit_sum' => (float) $totals->utilized_credit,
            'current_credit_sum' => (float) $totals->current_credit,
        ];
    }
}
