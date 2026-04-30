<?php

declare(strict_types=1);

namespace App\Http\Resources\Stock;

use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Stock
 */
class StockListResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'imei' => $this->imei,
            'batch_number' => $this->stockPurchaseItem?->stockPurchase?->batch_number,
            'stock_purchase_id' => $this->stockPurchaseItem?->stockPurchase?->id,
            'product_title' => $this->product?->title,
            'product_brand' => $this->product?->brand?->name,
            'product_model' => $this->product?->model,
            'condition' => $this->condition?->name,
            'purchase_price' => $this->purchase_price,
            'sale_price' => $this->sale_price,
            'status' => $this->status?->value,
            'status_name' => $this->status?->getLabel(),
        ];
    }
}
