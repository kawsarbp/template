<?php

declare(strict_types=1);

namespace App\Http\Resources\Product;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin Product
 */
class ProductListResource extends JsonResource
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
            'title' => $this->title,
            'sku' => $this->sku,
            'brand' => $this->brand?->name,
            'brand_id' => $this->brand_id,
            'model' => $this->model,
            'condition' => $this->condition?->name,
            'is_active' => $this->is_active,
            'is_active_name' => $this->is_active->getLabel(),
            'available_stock_count' => (int) ($this->available_stock_count ?? 0),
            'stock_status' => ($this->available_stock_count ?? 0) > 0 ? 'In Stock' : 'Out of Stock',
            'thumbnail' => $this->getThumbnail($this->photos),
        ];
    }

    private function getThumbnail(mixed $photos)
    {
        if (empty($photos)) {
            return null;
        }

        if (is_array($photos)) {
            return filter_var($photos[0], FILTER_VALIDATE_URL) ? $photos[0] : Storage::url($photos[0]);
        }
    }
}
