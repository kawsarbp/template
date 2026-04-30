<?php

declare(strict_types=1);

namespace App\Http\Resources\Supplier;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Supplier
 */
class SupplierDetailResource extends JsonResource
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
            'supplier_id' => $this->supplier_id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'company_name' => $this->company_name,
            'address' => $this->address,
            'currency' => $this->currency?->value,
            'balance' => $this->balance,
            'status' => $this->status,
            'status_name' => $this->status->getLabel(),
            'history_url' => $this->activity_log ? url(getAuditHistoryPageUrl($this->activity_log->description, $this->activity_log->id)) : '',
        ];
    }
}
