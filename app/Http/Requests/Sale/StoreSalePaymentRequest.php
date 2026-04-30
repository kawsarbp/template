<?php

declare(strict_types=1);

namespace App\Http\Requests\Sale;

use Illuminate\Foundation\Http\FormRequest;

class StoreSalePaymentRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'bank_account_id' => 'required|exists:bank_accounts,id',
            'notes' => 'nullable|string',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $sale = $this->route('sale');

            if ($sale && $this->input('amount') > $sale->total_due) {
                $validator->errors()->add(
                    'amount',
                    'Payment amount cannot exceed the total due ('.$sale->total_due.').'
                );
            }
        });
    }
}
