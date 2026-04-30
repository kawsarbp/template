<?php

namespace App\Http\Resources\Report;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerAdvanceReportResource extends JsonResource
{
    public function toArray(Request $request)
    {
        return [
            'date' => dateFormat($this->date),
            'voucher_number' => $this->voucher_number,
            'name' => data_get($this, 'customer.name'),
            'description' => $this->note,
            'debit' => $this->amount > 0 ? priceFormat($this->amount, 0) : 0,
            'credit' => $this->amount < 0 ? priceFormat(abs($this->amount), 0) : 0,
        ];
    }
}
