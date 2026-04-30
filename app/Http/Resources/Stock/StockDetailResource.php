<?php

declare(strict_types=1);

namespace App\Http\Resources\Stock;

use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Stock
 */
class StockDetailResource extends JsonResource
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
            'product_id' => $this->product_id,
            'product_title' => $this->product?->title,
            'product_brand' => $this->product?->brand?->name,
            'product_model' => $this->product?->model,
            'condition' => $this->condition?->id,
            'condition_name' => $this->condition?->name,
            'purchase_price' => $this->purchase_price,
            'sale_price' => $this->sale_price,
            'status' => $this->status?->value,
            'status_name' => $this->status?->getLabel(),
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
