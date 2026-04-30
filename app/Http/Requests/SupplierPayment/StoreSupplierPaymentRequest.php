<?php

namespace App\Http\Requests\SupplierPayment;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSupplierPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_date' => ['required', 'date'],
            'bank_account_id' => ['required', 'exists:bank_accounts,id'],
            'paid_to' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'attachment' => ['nullable', 'array'],
            'attachment.*' => ['string'],
            'line_items' => ['nullable', 'array'],
            'line_items.*.stock_purchase_id' => ['required_with:line_items', 'exists:stock_purchases,id'],
            'line_items.*.pay_now' => ['required_with:line_items', 'numeric', 'min:0.01'],
        ];
    }
}
