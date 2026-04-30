<?php

declare(strict_types=1);

namespace App\Actions\BankAccount;

use App\Http\Resources\BankAccount\BankAccountDetailResource;
use App\Models\BankAccount;

class UpdateBankAccountAction
{
    public function execute(BankAccount $bankAccount, array $data): BankAccountDetailResource
    {
        $bankAccount->update($data);

        return new BankAccountDetailResource($bankAccount);
    }
}
