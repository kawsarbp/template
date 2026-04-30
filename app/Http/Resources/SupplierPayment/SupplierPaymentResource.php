<?php

declare(strict_types=1);

namespace App\Http\Resources\SupplierPayment;

use App\Models\StockPurchasePayment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin StockPurchasePayment
 */
class SupplierPaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'voucher_number' => $this->voucher_number,
            'supplier_id' => $this->supplier_id,
            'supplier_name' => $this->supplier?->name,
            'currency' => $this->currency,
            'amount' => $this->amount,
            'payment_date' => dateFormat($this->payment_date),
            'bank_account_id' => $this->bank_account_id,
            'bank_account_name' => $this->bankAccount?->holder_name,
            'paid_to' => $this->paid_to,
            'notes' => $this->notes,
            'batch_numbers' => $this->children->map(fn ($child) => $child->stockPurchase?->batch_number)->filter()->implode(', '),
            'utilized' => $this->children_sum_amount ?? $this->children()->sum('amount'),
            'balance' => $this->amount - ($this->children_sum_amount ?? $this->children()->sum('amount')),
            'pdf_url' => url('/stock-purchases/multi-payment-receipt?payment_id='.$this->id),
        ];
    }
}
