<?php

namespace App\Http\Resources\AdvanceAccount;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class AdvanceAccountListResource extends JsonResource
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
            'customer_name' => data_get($this, 'customer.name'),
            'type' => $this->type->value,
            'type_name' => $this->type->getLabel(),
            'voucher_number' => $this->voucher_number,
            'amount' => priceFormat(abs($this->amount)),
            'date' => dateFormat($this->date),
            'note' => $this->note,
            'bank_account' => data_get($this, 'bank_account.holder_name'),
            'attachment' => $this->getAttachment($this->attachment),
            'pdf_url' => url('advanced-accounts-receipt/'.$this->id),
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
