<?php

declare(strict_types=1);

namespace App\Http\Resources\Stock;

use App\Models\StockPurchase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin StockPurchase
 */
class StockPurchaseListResource extends JsonResource
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
            'batch_number' => $this->batch_number,
            'supplier_name' => $this->supplier?->name,
            'currency' => $this->currency,
            'exchange_rate' => $this->exchange_rate,
            'total_units' => $this->total_units,
            'total_amount' => $this->currency === 'HKD'
                ? round($this->total_amount * ($this->exchange_rate ?? 1), 2)
                : $this->total_amount,
            'discount' => $this->discount,
            'total_paid' => $this->currency === 'HKD'
                ? round($this->total_paid * ($this->exchange_rate ?? 1), 2)
                : $this->total_paid,
            'total_due' => $this->currency === 'HKD'
                ? round($this->total_due * ($this->exchange_rate ?? 1), 2)
                : $this->total_due,
            'payment_status' => $this->payment_status?->value,
            'payment_status_name' => $this->payment_status?->getLabel(),
            'purchase_date' => dateFormat($this->purchase_date),
        ];
    }
}
