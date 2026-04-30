<?php

namespace App\Http\Resources\Report;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalePaymentReportResource extends JsonResource
{
    public function toArray(Request $request)
    {
        return [
            'date' => dateFormat($this->payment_date),
            'voucher_number' => $this->voucher_number,
            'name' => data_get($this, 'sale.customer.name'),
            'description' => $this->notes,
            'debit' => $this->amount > 0 ? priceFormat($this->amount, 0) : '',
            'credit' => $this->amount < 0 ? priceFormat(abs($this->amount), 0) : '',
        ];
    }
}
