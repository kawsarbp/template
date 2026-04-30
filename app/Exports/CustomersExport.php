<?php

namespace App\Exports;

use App\Services\CustomerService;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CustomersExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(protected array $filters = []) {}

    public function query()
    {
        return app(CustomerService::class)->getQuery($this->filters);
    }

    public function headings(): array
    {
        return [
            'CUSTOMER ID',
            'NAME',
            'EMAIL',
            'PHONE',
            'COMPANY NAME',
            'ADDRESS',
            'COUNTRY',
            'STATE',
            'CITY',
            'STATUS',
        ];
    }

    public function map($row): array
    {
        return [
            $row->customer_id,
            $row->name,
            $row->email,
            $row->phone,
            $row->company_name,
            $row->address,
            $row->country,
            $row->state,
            $row->city,
            $row->status?->getLabel(),
        ];
    }
}
