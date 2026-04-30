<?php

declare(strict_types=1);

namespace App\Actions\AdvanceAccount;

use App\Services\AdvanceAccountService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class ListAdvanceAccountsAction
{
    public function __construct(
        private AdvanceAccountService $advanceAccountService,
    ) {}

    public function execute(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->advanceAccountService->getFiltered($filters, $perPage);
    }

    public function all(array $filters = []): Collection
    {
        return $this->advanceAccountService->getAllFiltered($filters);
    }

    public function query(array $filters = []): Builder
    {
        return $this->advanceAccountService->getQuery($filters);
    }

    public function getAdvanceSummary($filters = []): array
    {
        $result = $this->all($filters);
        $totalAmount = $result->sum('advance_payment_balance');

        return [
            'total_amount' => priceFormat($totalAmount),
        ];
    }
}
