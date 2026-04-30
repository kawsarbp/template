<?php

declare(strict_types=1);

namespace App\Http\Resources\SaleReturn;

use App\Models\SaleReturn;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin SaleReturn
 */
class SaleReturnDetailResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'return_number' => $this->return_number,
            'customer_id' => $this->customer_id,
            'customer_name' => $this->customer?->name,
            'total_units' => $this->total_units,
            'total_amount' => $this->total_amount,
            'discount' => $this->discount,
            'total_refunded' => $this->total_refunded,
            'total_due' => $this->total_due,
            'payment_status' => $this->payment_status?->value,
            'payment_status_name' => $this->payment_status?->getLabel(),
            'return_date' => $this->return_date?->format('Y-m-d'),
            'return_date_formatted' => dateFormat($this->return_date),
            'notes' => $this->notes,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'stock_id' => $item->stock_id,
                'imei' => $item->stock?->imei,
                'product_brand' => $item->stock?->product?->brand?->name,
                'product_model' => $item->stock?->product?->model,
                'condition' => $item->stock?->condition?->id,
                'condition_name' => $item->stock?->condition?->name,
                'return_price' => $item->return_price,
                'source_type' => $item->source_type ?? 'stock',
                'line_number' => $item->line_number ?? 1,
                'stock_purchase_id' => $item->stock_purchase_id,
                'batch_number' => $item->stockPurchase?->batch_number,
            ])),
            'payments' => $this->whenLoaded('payments', fn () => $this->payments->map(fn ($payment) => [
                'id' => $payment->id,
                'amount' => $payment->amount,
                'payment_date' => dateFormat($payment->payment_date),
                'bank_account_id' => $payment->bank_account_id,
                'bank_account_name' => $payment->bankAccount?->holder_name,
                'notes' => $payment->notes,
                'receipt_url' => '/sale-return-payments/receipt?payment_id='.$payment->id,
            ])),
            'history_url' => $this->activity_log ? url(getAuditHistoryPageUrl($this->activity_log->description, $this->activity_log->id)) : '',
        ];
    }
}
