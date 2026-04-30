<?php

namespace App\Http\Requests\AdvanceAccount;

use App\Enums\AdvanceAccountType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreAdvanceAccountRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'customer_id' => 'required',
            'voucher_number' => [
                'nullable', Rule::unique('advanced_accounts', 'voucher_number')
                    ->whereNull('deleted_at'),
            ],
            'date' => 'required|date',
            'amount' => 'required|numeric',
            'note' => 'nullable|string',
            'attachment' => 'nullable|array',
            'bank_account_id' => 'required',
            'type' => ['required', new Enum(AdvanceAccountType::class)],
        ];
    }
}
