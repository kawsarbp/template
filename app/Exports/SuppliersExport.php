<?php

namespace App\Exports;

use App\Services\SupplierService;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SuppliersExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(protected array $filters = []) {}

    public function query()
    {
        return app(SupplierService::class)->getQuery($this->filters);
    }

    public function headings(): array
    {
        return [
            'SUPPLIER ID',
            'NAME',
            'EMAIL',
            'PHONE',
            'COMPANY NAME',
            'ADDRESS',
            'CURRENCY',
            'STATUS',
        ];
    }

    public function map($row): array
    {
        return [
            $row->supplier_id,
            $row->name,
            $row->email,
            $row->phone,
            $row->company_name,
            $row->address,
            $row->currency?->value,
            $row->status?->getLabel(),
        ];
    }
}
