<?php

declare(strict_types=1);

namespace App\Actions\Cashflow;

use App\Http\Resources\Cashflow\CashflowDetailResource;
use App\Models\CashflowTransaction;
use Illuminate\Support\Arr;

class UpdateCashflowAction
{
    public function execute(CashflowTransaction $cashflowTransaction, array $data): CashflowDetailResource
    {
        $data['attachment'] = empty($data['attachment']) ?
            [] : Arr::map($data['attachment'], function (string $value) {
                return getRelativeUrl($value);
            });

        $cashflowTransaction->update($data);

        return new CashflowDetailResource($cashflowTransaction);
    }
}
