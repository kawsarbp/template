<?php

namespace App\Exports;

use App\Services\ProductService;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ProductsExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(protected array $filters = []) {}

    public function query()
    {
        return app(ProductService::class)->getQuery($this->filters);
    }

    public function headings(): array
    {
        return [
            'SKU',
            'TITLE',
            'BRAND',
            'MODEL',
            'CONDITION',
            'STATUS',
            'IS ACTIVE',
            'AVAILABLE STOCK',
        ];
    }

    public function map($row): array
    {
        return [
            $row->sku,
            $row->title,
            $row->brand?->name,
            $row->model,
            $row->condition?->name,
            $row->status?->getLabel(),
            $row->is_active?->getLabel(),
            (int) ($row->available_stock_count ?? 0),
        ];
    }
}
