<?php

declare(strict_types=1);

namespace App\Http\Requests\SaleReturn;

use Illuminate\Foundation\Http\FormRequest;

class StoreSaleReturnPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'bank_account_id' => 'required|exists:bank_accounts,id',
            'notes' => 'nullable|string',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $saleReturn = $this->route('sale_return');
            $amount = (float) $this->input('amount');

            if ($saleReturn && $amount > $saleReturn->total_due) {
                $validator->errors()->add('amount', __('Refund amount cannot exceed the total due.'));
            }
        });
    }
}
