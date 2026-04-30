<?php

declare(strict_types=1);

namespace App\Http\Requests\Stock;

use App\Enums\Currency;
use App\Models\Supplier;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStockPurchaseRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $items = $this->input('items', []);

        foreach ($items as $index => $item) {
            if (isset($item['imeis']) && is_string($item['imeis'])) {
                $items[$index]['imeis'] = array_values(
                    array_filter(
                        array_map('trim', preg_split('/[\n,]+/', $item['imeis']))
                    )
                );
            }
        }

        $this->merge(['items' => $items]);
    }

    public function rules(): array
    {
        return [
            'batch_number' => ['required', 'string', 'max:100', Rule::unique('stock_purchases', 'batch_number')->whereNull('deleted_at')],
            'supplier_id' => 'required|exists:suppliers,id',
            'purchase_date' => 'required|date',
            'exchange_rate' => 'nullable|numeric|min:0.0001',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'attachment' => 'nullable|array',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.condition_id' => ['required', 'integer', 'exists:conditions,id'],
            'items.*.sale_price' => 'nullable|numeric|min:0',
            'items.*.imeis' => 'required|array',
            'items.*.imeis.*' => ['required', 'string', 'max:20', 'distinct', Rule::unique('stocks', 'imei')->whereNull('deleted_at')],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $supplier = Supplier::find($this->input('supplier_id'));
            if ($supplier?->currency === Currency::HKD && empty($this->input('exchange_rate'))) {
                $validator->errors()->add('exchange_rate', 'Exchange rate is required for HKD suppliers.');
            }

            $items = $this->input('items', []);
            foreach ($items as $index => $item) {
                $quantity = (int) ($item['quantity'] ?? 0);
                $imeis = $item['imeis'] ?? [];
                if (count($imeis) !== $quantity) {
                    $validator->errors()->add(
                        "items.{$index}.imeis",
                        'The number of IMEIs ('.count($imeis).") must match the quantity ({$quantity})."
                    );
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'items.*.imeis.required' => 'IMEIs are required for each item.',
            'items.*.imeis.*.required' => 'Each IMEI is required.',
            'items.*.imeis.*.unique' => 'The IMEI :input has already been taken.',
            'items.*.imeis.*.distinct' => 'Duplicate IMEI :input found in this request.',
        ];
    }
}
