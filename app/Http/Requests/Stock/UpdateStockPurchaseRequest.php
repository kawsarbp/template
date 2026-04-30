<?php

declare(strict_types=1);

namespace App\Http\Requests\Stock;

use App\Enums\Currency;
use App\Models\Supplier;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStockPurchaseRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'batch_number' => [
                'required',
                'string',
                'max:100',
                Rule::unique('stock_purchases', 'batch_number')->ignore($this->route('stock_purchase'))->whereNull('deleted_at'),
            ],
            'supplier_id' => 'required|exists:suppliers,id',
            'purchase_date' => 'required|date',
            'exchange_rate' => 'nullable|numeric|min:0.0001',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'attachment' => 'nullable|array',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $supplier = Supplier::find($this->input('supplier_id'));
            if ($supplier?->currency === Currency::HKD && empty($this->input('exchange_rate'))) {
                $validator->errors()->add('exchange_rate', 'Exchange rate is required for HKD suppliers.');
            }
        });
    }
}
