<?php

declare(strict_types=1);

namespace App\Http\Resources\Cashflow;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin Customer
 */
class CashflowListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'date' => $this->date,
            'date_formatted' => dateFormat($this->date),
            'voucher_number' => $this->voucher_number,
            'description' => $this->description,
            'type' => $this->type,
            'type_name' => $this->type->getLabel(),
            'amount' => round($this->amount, 2),
            'attachment' => $this->getAttachment($this->attachment),
            'receipt_pdf' => url('cashflow-transactions-print-receipt-pdf', $this->id),
        ];
    }

    private function getAttachment(mixed $attachments)
    {
        if (empty($attachments)) {
            return null;
        }

        if (is_array($attachments)) {
            return array_map(fn ($attachment) => filter_var($attachment, FILTER_VALIDATE_URL) ? $attachment : Storage::url($attachment), $attachments);
        }
    }
}
