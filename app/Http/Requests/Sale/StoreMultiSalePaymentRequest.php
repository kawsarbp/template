<?php

declare(strict_types=1);

namespace App\Http\Requests\Sale;

use Illuminate\Foundation\Http\FormRequest;

class StoreMultiSalePaymentRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'sale_ids' => 'required|array|min:1',
            'sale_ids.*' => 'required|exists:sales,id',
            'payment_date' => 'required|date',
            'paid_amount' => ['required', 'array'],
            'paid_amount.*' => ['required', 'numeric', 'min:1'],
            'bank_account_id' => 'required|exists:bank_accounts,id',
            'notes' => 'nullable|string',
            'received_from' => 'nullable',
            'attachment' => 'nullable|array',
        ];
    }

    public function messages(): array
    {
        return [
            'bank_account_id.required' => 'The bank account name is required.',
            'paid_amount.*.required' => 'Amount field is required.',
            'paid_amount.*.numeric' => 'Must be a valid number.',
            'paid_amount.*.min' => 'Paid amount must be at least 1.',
        ];
    }
}
