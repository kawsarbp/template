<?php

declare(strict_types=1);

namespace App\Http\Resources\Stock;

use App\Models\StockPurchase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin StockPurchase
 */
class StockPurchaseDetailResource extends JsonResource
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
            'supplier_id' => $this->supplier_id,
            'supplier_name' => $this->supplier?->name,
            'supplier_currency' => $this->supplier?->currency?->value,
            'currency' => $this->currency,
            'exchange_rate' => $this->exchange_rate,
            'total_units' => $this->total_units,
            'total_amount' => $this->total_amount,
            'discount' => $this->discount,
            'total_paid' => $this->total_paid,
            'total_due' => $this->total_due,
            'payment_status' => $this->payment_status?->value,
            'payment_status_name' => $this->payment_status?->getLabel(),
            'purchase_date' => $this->purchase_date?->format('Y-m-d'),
            'purchase_date_formatted' => dateFormat($this->purchase_date),
            'notes' => $this->notes,
            'attachment' => $this->getAttachment($this->attachment),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_title' => $item->product?->title,
                'product_brand' => $item->product?->brand?->name,
                'product_model' => $item->product?->model,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'condition' => $item->condition?->id,
                'condition_name' => $item->condition?->name,
            ])),
            'stocks' => StockListResource::collection($this->whenLoaded('stocks')),
            'payments' => $this->whenLoaded('payments', fn () => $this->payments->map(fn ($payment) => [
                'id' => $payment->id,
                'amount' => $payment->amount,
                'payment_date' => dateFormat($payment->payment_date),
                'payment_date_raw' => $payment->payment_date?->format('Y-m-d'),
                'bank_account_id' => $payment->bank_account_id,
                'bank_account_name' => $payment->bankAccount?->holder_name,
                'notes' => $payment->notes,
                'receipt_url' => '/stock-purchases/multi-payment-receipt?payment_id='.$payment->id,
            ])),
            'pdf_url' => url('stock-purchases-pdf', $this->id),
            'history_url' => $this->activity_log ? url(getAuditHistoryPageUrl($this->activity_log->description, $this->activity_log->id)) : '',
        ];
    }

    private function getAttachment(mixed $attachments): array|string|null
    {
        if (empty($attachments)) {
            return null;
        }

        if (is_array($attachments)) {
            return array_map(fn ($attachment) => $this->formatAttachment($attachment), $attachments);
        }

        return $this->formatAttachment($attachments);
    }

    private function formatAttachment(string $attachment): string
    {
        return filter_var($attachment, FILTER_VALIDATE_URL) ? $attachment : Storage::url($attachment);
    }
}
