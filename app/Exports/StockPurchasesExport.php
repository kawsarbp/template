<?php

namespace App\Exports;

use App\Services\StockPurchaseService;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class StockPurchasesExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(protected array $filters = []) {}

    public function query()
    {
        return app(StockPurchaseService::class)->getQuery($this->filters);
    }

    public function headings(): array
    {
        return [
            'BATCH #',
            'SUPPLIER',
            'TOTAL UNITS',
            'TOTAL AMOUNT',
            'DISCOUNT',
            'TOTAL PAID',
            'TOTAL DUE',
            'PAYMENT STATUS',
            'PURCHASE DATE',
        ];
    }

    public function map($row): array
    {
        return [
            $row->batch_number,
            $row->supplier?->name,
            $row->total_units,
            $row->total_amount,
            $row->discount,
            $row->total_paid,
            $row->total_due,
            $row->payment_status?->getLabel(),
            $row->purchase_date?->format('Y-m-d'),
        ];
    }
}
