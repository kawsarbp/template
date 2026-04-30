<?php

declare(strict_types=1);

namespace App\Actions\BankAccount;

use App\Models\BankAccount;

class DeleteBankAccountAction
{
    public function execute(BankAccount $bankAccount): bool
    {
        return $bankAccount->delete();
    }
}
