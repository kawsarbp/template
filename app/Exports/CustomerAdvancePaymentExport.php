<?php

namespace App\Exports;

use App\Services\AdvanceAccountService;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CustomerAdvancePaymentExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(protected array $filters = []) {}

    public function query()
    {
        return app(AdvanceAccountService::class)->getQuery($this->filters);
    }

    public function headings(): array
    {
        return [
            'CUSTOMER NAME',
            'ADVANCE BALANCE',
        ];
    }

    public function map($row): array
    {
        return [
            $row->name,
            $row->advance_payment_balance,
        ];
    }
}
