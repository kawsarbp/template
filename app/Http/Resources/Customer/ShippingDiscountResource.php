<?php

declare(strict_types=1);

namespace App\Http\Resources\Customer;

use App\Models\Customer;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Customer
 */
class ShippingDiscountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'vin_number' => $this->product_service->name,
            'invoice_number' => $this->shipping_invoice->invoice_id_str,
            'purchase_date' => dateFormat($this->product_service->purchase_date),
            'arrival_date' => dateFormat($this->product_service->arrival_date),
            'payment_date' => dateFormat($this->paid_date),
            'diff_days' => Carbon::parse($this->product_service->arrival_date)->startOfDay()->diffInDays($this->paid_date),
            'discount' => $this->discount,
        ];
    }
}
