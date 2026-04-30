<?php

namespace App\Http\Resources\Report;

use App\Enums\BooleanStatus;
use App\Enums\InvoiceStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VatReturnReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'sale_date' => dateFormat($this->vehicle?->sold_at),
            'vin_number' => $this->vehicle?->vin,
            'description' => $this->vehicle?->description,
            'customer_name' => $this->customer?->name,
            'vat' => $this->vat,
            'vat_return' => $this->is_vat_return == BooleanStatus::YES ? $this->vat : 0,
            'vat_return_date' => dateFormat($this->vat_return_date),
            'vat_status' => $this->is_vat_return == BooleanStatus::YES ? 'Returned' : ($this->status == InvoiceStatus::PAID ? 'Collected' : 'Pending'),
        ];
    }
}
