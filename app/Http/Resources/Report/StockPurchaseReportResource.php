<?php

namespace App\Http\Resources\Report;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockPurchaseReportResource extends JsonResource
{
    public function toArray(Request $request)
    {
        return [
            'date' => dateFormat($this->payment_date),
            'voucher_number' => $this->voucher_number,
            'name' => $this->stockPurchase?->supplier?->name,
            'description' => data_get($this, 'notes'),
            'debit' => 0,
            'credit' => priceFormat($this->amount, 0),
        ];
    }
}
