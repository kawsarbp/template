<?php

declare(strict_types=1);

namespace App\Http\Resources\Brand;

use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Brand
 */
class BrandDetailResource extends JsonResource
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
            'name' => $this->name,
            'status' => $this->status,
            'status_name' => $this->status->getLabel(),
            'history_url' => $this->activity_log ? url(getAuditHistoryPageUrl($this->activity_log->description, $this->activity_log->id)) : '',
        ];
    }
}
