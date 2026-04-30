<?php

declare(strict_types=1);

namespace App\Actions\AdvanceAccount;

use App\Models\AdvancedAccount;
use App\Models\Customer;
use Illuminate\Support\Facades\DB;

class DeleteAdvanceAccountAction
{
    public function execute(AdvancedAccount $advancedAccount)
    {
        return DB::transaction(function () use ($advancedAccount) {
            $customerId = $advancedAccount->customer_id;
            $advancedAccount->delete();

            $balance = round((float) AdvancedAccount::where('customer_id', $customerId)->sum('amount'), 2);
            Customer::find($customerId)->update(['advance_payment_balance' => $balance]);

        }, 2);
    }
}
