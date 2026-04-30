<?php

declare(strict_types=1);

namespace App\Http\Resources\SaleReturn;

use App\Models\SaleReturn;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin SaleReturn
 */
class SaleReturnListResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'return_number' => $this->return_number,
            'customer_name' => $this->customer?->name,
            'total_units' => $this->total_units,
            'total_amount' => $this->total_amount,
            'discount' => $this->discount,
            'total_refunded' => $this->total_refunded,
            'total_due' => $this->total_due,
            'payment_status' => $this->payment_status?->value,
            'payment_status_name' => $this->payment_status?->getLabel(),
            'return_date' => dateFormat($this->return_date),
        ];
    }
}
