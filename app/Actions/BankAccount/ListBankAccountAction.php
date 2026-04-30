<?php

declare(strict_types=1);

namespace App\Actions\BankAccount;

use App\Services\BankAccountService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

readonly class ListBankAccountAction
{
    public function __construct(
        private BankAccountService $bankAccountService,
    ) {}

    public function execute(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->bankAccountService->getFiltered($filters, $perPage);
    }
}
