<?php

declare(strict_types=1);

namespace App\Http\Requests\SaleReturn;

use App\Enums\StockStatus;
use App\Models\Stock;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSaleReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => 'nullable|exists:customers,id',
            'return_date' => 'required|date',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'sometimes|array|min:1',
            'items.*.stock_id' => 'required_with:items|exists:stocks,id',
            'items.*.return_price' => 'required_with:items|numeric|min:0',
            'items.*.source_type' => 'sometimes|in:stock,glot',
            'items.*.line_number' => 'sometimes|integer|min:1',
            'items.*.stock_purchase_id' => 'nullable|exists:stock_purchases,id',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (! $this->has('items')) {
                return;
            }

            $items = $this->input('items', []);
            $stockIds = array_column($items, 'stock_id');
            $saleReturn = $this->route('sale_return');

            $duplicates = array_diff_assoc($stockIds, array_unique($stockIds));
            if (count($duplicates) > 0) {
                $validator->errors()->add('items', __('Duplicate stock items are not allowed.'));
            }

            $existingStockIds = $saleReturn->items()->pluck('stock_id')->toArray();

            foreach ($items as $index => $item) {
                $stockId = $item['stock_id'] ?? null;
                if ($stockId && ! in_array($stockId, $existingStockIds)) {
                    $stock = Stock::find($stockId);
                    if ($stock && $stock->status !== StockStatus::SOLD) {
                        $validator->errors()->add(
                            "items.{$index}.stock_id",
                            __('Stock item :imei is not in sold status and cannot be returned.', ['imei' => $stock->imei ?? $stockId])
                        );
                    }
                }
            }
        });
    }
}
