<?php

namespace App\Http\Resources\AdvanceAccount;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerAdvanceReport extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date' => dateFormat($this->date),
            'voucher_number' => $this->voucher_number,
            'note' => $this->note,
            'bank_account' => data_get($this, 'bank_account.holder_name'),
            'amount_received' => $this->amount > 0 ? priceFormat($this->amount) : 0,
            'advance_utilized' => $this->amount < 0 ? priceFormat(abs($this->amount)) : 0,
            'balance' => priceFormat($this->balance),
        ];
    }
}
