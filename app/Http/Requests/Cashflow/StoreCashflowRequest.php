<?php

declare(strict_types=1);

namespace App\Http\Requests\Cashflow;

use App\Enums\CashflowType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreCashflowRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:150',
            'date' => 'required|date',
            'description' => 'nullable|string',
            'type' => ['required', 'integer', new Enum(CashflowType::class)],
            'amount' => 'required|numeric',
            'bank_account_id' => 'required|integer',
            'attachment' => 'nullable|array',
        ];
    }

    public function messages(): array
    {
        return [
            'bank_account_id.required' => 'The payment mode field is required.',
        ];
    }
}
