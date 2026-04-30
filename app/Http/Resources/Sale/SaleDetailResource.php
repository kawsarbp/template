<?php

declare(strict_types=1);

namespace App\Http\Resources\Sale;

use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Sale
 */
class SaleDetailResource extends JsonResource
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
            'customer_id' => $this->customer_id,
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
            'sale_date' => $this->sale_date?->format('Y-m-d'),
            'sale_date_formatted' => dateFormat($this->sale_date),
            'notes' => $this->notes,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'stock_id' => $item->stock_id,
                'imei' => $item->stock?->imei,
                'product_brand' => $item->stock?->product?->brand?->name,
                'product_model' => $item->stock?->product?->model,
                'condition' => $item->stock?->condition?->id,
                'condition_name' => $item->stock?->condition?->name,
                'sale_price' => $item->sale_price,
                'source_type' => $item->source_type ?? 'stock',
                'line_number' => $item->line_number ?? 1,
                'stock_purchase_id' => $item->stock_purchase_id,
                'batch_number' => $item->stockPurchase?->batch_number,
            ])),
            'payments' => $this->whenLoaded('payments', fn () => $this->payments->map(fn ($payment) => [
                'id' => $payment->id,
                'amount' => $payment->amount,
                'payment_date' => dateFormat($payment->payment_date),
                'payment_date_raw' => $payment->payment_date?->format('Y-m-d'),
                'bank_account_id' => $payment->bank_account_id,
                'bank_account_name' => $payment->bankAccount?->holder_name,
                'notes' => $payment->notes,
                'receipt_url' => '/sales/multi-payment-receipt?payment_id='.$payment->id,
            ])),
            'history_url' => $this->activity_log ? url(getAuditHistoryPageUrl($this->activity_log->description, $this->activity_log->id)) : '',
        ];
    }
}
