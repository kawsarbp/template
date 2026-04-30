<?php

declare(strict_types=1);

namespace App\Actions\BankAccount;

use App\Http\Resources\BankAccount\BankAccountDetailResource;
use App\Models\BankAccount;

class StoreBankAccountAction
{
    public function execute(array $data): BankAccountDetailResource
    {
        $data['created_by'] = auth()->id();
        $bankAccount = BankAccount::create($data);

        return new BankAccountDetailResource($bankAccount);
    }
}
