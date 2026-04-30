<?php

declare(strict_types=1);

namespace App\Http\Requests\Sale;

use App\Enums\SaleType;
use App\Enums\StockStatus;
use App\Models\Stock;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateSaleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'customer_id' => 'nullable|exists:customers,id',
            'sale_type' => ['required', new Enum(SaleType::class)],
            'sale_date' => 'required|date',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'sometimes|array|min:1',
            'items.*.stock_id' => 'required_with:items|exists:stocks,id',
            'items.*.sale_price' => 'required_with:items|numeric|min:0',
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
            if (! $this->has('items')) {
                return;
            }

            $items = $this->input('items', []);
            $stockIds = array_column($items, 'stock_id');
            $sale = $this->route('sale');

            // Check for duplicate stock_ids
            $duplicates = array_diff_assoc($stockIds, array_unique($stockIds));
            if (count($duplicates) > 0) {
                $validator->errors()->add('items', __('Duplicate stock items are not allowed.'));
            }

            // Get existing stock IDs in this sale
            $existingStockIds = $sale->items()->pluck('stock_id')->toArray();

            // Check new stocks are AVAILABLE
            foreach ($items as $index => $item) {
                $stockId = $item['stock_id'] ?? null;
                if ($stockId && ! in_array($stockId, $existingStockIds)) {
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
