<?php

declare(strict_types=1);

namespace App\Http\Resources\Sale;

use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Sale
 */
class SaleListResource extends JsonResource
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
            'sale_number' => $this->sale_number,
            'customer_name' => $this->customer?->name,
            'sale_type' => $this->sale_type?->value,
            'sale_type_name' => $this->sale_type?->getLabel(),
            'total_units' => $this->total_units,
            'total_amount' => $this->total_amount,
            'discount' => $this->discount,
            'total_paid' => $this->total_paid,
            'total_due' => $this->total_due,
            'payment_status' => $this->payment_status?->value,
            'payment_status_name' => $this->payment_status?->getLabel(),
            'sale_date' => dateFormat($this->sale_date),
        ];
    }
}
