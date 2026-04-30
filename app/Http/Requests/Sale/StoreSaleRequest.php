<?php

declare(strict_types=1);

namespace App\Http\Requests\Sale;

use App\Enums\SaleType;
use App\Enums\StockStatus;
use App\Models\Stock;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreSaleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'customer_id' => 'nullable|exists:customers,id',
            'sale_type' => ['required', new Enum(SaleType::class)],
            'sale_date' => 'required|date',
            'discount' => 'nullable|numeric|min:0',
            'payment' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.stock_id' => 'required|exists:stocks,id',
            'items.*.sale_price' => 'required|numeric|min:0',
            'items.*.source_type' => 'sometimes|in:stock,glot',
            'items.*.line_number' => 'sometimes|integer|min:1',
            'items.*.stock_purchase_id' => 'nullable|exists:stock_purchases,id',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $items = $this->input('items', []);
            $stockIds = array_column($items, 'stock_id');

            // Check payment does not exceed grand total
            $payment = (float) ($this->input('payment') ?? 0);
            if ($payment > 0) {
                $items = $this->input('items', []);
                $totalAmount = (float) array_sum(array_column($items, 'sale_price'));
                $discount = (float) ($this->input('discount') ?? 0);
                $grandTotal = $totalAmount - $discount;

                if ($payment > $grandTotal) {
                    $validator->errors()->add('payment', __('Payment cannot exceed the grand total.'));
                }
            }

            // Check for duplicate stock_ids
            $duplicates = array_diff_assoc($stockIds, array_unique($stockIds));
            if (count($duplicates) > 0) {
                $validator->errors()->add('items', __('Duplicate stock items are not allowed.'));
            }

            // Check each stock is AVAILABLE
            foreach ($items as $index => $item) {
                $stockId = $item['stock_id'] ?? null;
                if ($stockId) {
                    $stock = Stock::find($stockId);
                    if ($stock && $stock->status !== StockStatus::AVAILABLE) {
                        $validator->errors()->add(
                            "items.{$index}.stock_id",
                            __('Stock item :imei is not available for sale.', ['imei' => $stock->imei ?? $stockId])
                        );
                    }
                }
            }
        });
    }
}
