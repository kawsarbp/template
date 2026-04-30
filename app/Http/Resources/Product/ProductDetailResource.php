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
class ProductDetailResource extends JsonResource
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
            'description' => $this->description,
            'brand' => $this->brand?->name,
            'brand_id' => $this->brand_id,
            'model' => $this->model,
            'color' => $this->color?->name,
            'color_id' => $this->color_id,
            'storage_capacity' => $this->storage_capacity,
            'ram' => $this->ram,
            'condition' => $this->condition?->id,
            'condition_name' => $this->condition?->name,
            'operating_system' => $this->operating_system,
            'photos' => $this->getPhotos($this->photos),
            'is_active' => $this->is_active?->value,
            'is_active_name' => $this->is_active?->getLabel(),
            'available_stock_count' => (int) ($this->available_stock_count ?? 0),
            'stock_status' => ($this->available_stock_count ?? 0) > 0 ? 'In Stock' : 'Out of Stock',
            'history_url' => $this->activity_log ? url(getAuditHistoryPageUrl($this->activity_log->description, $this->activity_log->id)) : '',
        ];
    }

    private function getPhotos(mixed $photos)
    {
        if (empty($photos)) {
            return null;
        }

        if (is_array($photos)) {
            return array_map(fn ($image) => filter_var($image, FILTER_VALIDATE_URL) ? $image : Storage::url($image), $photos);
        }
    }
}
