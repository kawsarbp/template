<?php

namespace App\Exports;

use App\Services\StockService;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class StocksExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(protected array $filters = []) {}

    public function query()
    {
        return app(StockService::class)->getQuery($this->filters);
    }

    public function headings(): array
    {
        return [
            'IMEI',
            'PRODUCT',
            'BRAND',
            'CONDITION',
            'SALE PRICE',
            'STATUS',
        ];
    }

    public function map($row): array
    {
        return [
            $row->imei,
            $row->product?->title,
            $row->product?->brand?->name,
            $row->condition?->name,
            $row->sale_price,
            $row->status?->getLabel(),
        ];
    }
}
