<?php

namespace App\Http\Resources\Report;

use App\Enums\CashflowType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CashflowReportResource extends JsonResource
{
    public function toArray(Request $request)
    {
        return [
            'date' => dateFormat($this->date),
            'voucher_number' => $this->voucher_number,
            'name' => data_get($this, 'name'),
            'description' => data_get($this, 'description'),
            'debit' => $this->type == CashflowType::CASH_IN ? priceFormat($this->amount, 0) : 0,
            'credit' => $this->type == CashflowType::CASH_OUT ? priceFormat($this->amount, 0) : 0,
        ];
    }
}
