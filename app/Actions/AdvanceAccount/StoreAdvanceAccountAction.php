<?php

declare(strict_types=1);

namespace App\Actions\AdvanceAccount;

use App\Enums\AdvanceAccountType;
use App\Http\Resources\AdvanceAccount\AdvanceAccountDetailResource;
use App\Models\AdvancedAccount;
use App\Models\Customer;
use Illuminate\Support\Arr;

class StoreAdvanceAccountAction
{
    public function execute(array $data): AdvanceAccountDetailResource
    {
        $data['attachment'] = empty($data['attachment']) ?
            [] : Arr::map($data['attachment'], function (string $value) {
                return getRelativeUrl($value);
            });

        $data['amount'] = $data['type'] == AdvanceAccountType::DEPOSIT->value ? abs((float) $data['amount']) : -abs((float) $data['amount']);
        $data['created_by'] = auth()->id();
        $advanceAccount = AdvancedAccount::create($data);

        $balance = round((float) AdvancedAccount::where('customer_id', $advanceAccount->customer_id)->sum('amount'), 2);
        Customer::find($advanceAccount->customer_id)->update(['advance_payment_balance' => $balance]);

        return new AdvanceAccountDetailResource($advanceAccount);
    }
}
