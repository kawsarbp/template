<?php

declare(strict_types=1);

namespace App\Http\Resources\SupplierPayment;

use App\Models\StockPurchasePayment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin StockPurchasePayment
 */
class SupplierPaymentEditResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplier_id,
            'supplier' => $this->supplier
                ? ['value' => $this->supplier->id, 'label' => $this->supplier->name]
                : null,
            'currency' => $this->currency,
            'amount' => $this->amount,
            'payment_date' => $this->payment_date?->format('Y-m-d'),
            'bank_account_id' => $this->bank_account_id,
            'bank_account' => $this->bankAccount
                ? ['value' => $this->bankAccount->id, 'label' => $this->bankAccount->holder_name]
                : null,
            'paid_to' => $this->paid_to,
            'notes' => $this->notes,
            'voucher_number' => $this->voucher_number,
            'attachment' => $this->getFormattedAttachments($this->attachment),
            'line_items' => $this->children->map(fn ($child) => [
                'id' => $child->id,
                'stock_purchase_id' => $child->stock_purchase_id,
                'batch_number' => $child->stockPurchase?->batch_number,
                'total_amount' => (float) $child->stockPurchase?->total_amount,
                'total_paid' => (float) $child->stockPurchase?->total_paid,
                'total_due' => (float) $child->stockPurchase?->total_due,
                'pay_now' => $child->amount,
            ])->values(),
        ];
    }

    private function getFormattedAttachments(mixed $attachments): array|string|null
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
