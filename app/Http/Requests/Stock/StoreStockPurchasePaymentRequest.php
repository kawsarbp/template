<?php

declare(strict_types=1);

namespace App\Http\Requests\Stock;

use Illuminate\Foundation\Http\FormRequest;

class StoreStockPurchasePaymentRequest extends FormRequest
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
            $purchase = $this->route('stock_purchase');

            if ($purchase && $this->input('amount') > $purchase->total_due) {
                $validator->errors()->add(
                    'amount',
                    'Payment amount cannot exceed the total due ('.$purchase->total_due.').'
                );
            }
        });
    }
}
