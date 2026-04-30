<?php

namespace App\Exports;

use App\Services\UserService;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class UsersExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(protected array $filters = []) {}

    public function query()
    {
        return app(UserService::class)->getQuery($this->filters);
    }

    public function headings(): array
    {
        return [
            'NAME',
            'EMAIL',
            'ROLE',
            'STATUS',
        ];
    }

    public function map($row): array
    {
        $role = $row->role->first();

        return [
            $row->name,
            $row->email,
            $role?->name,
            $row->status->getLabel(),
        ];
    }
}
