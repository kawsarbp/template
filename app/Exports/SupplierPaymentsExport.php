<?php

namespace App\Exports;

use App\Services\SupplierPaymentService;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SupplierPaymentsExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(protected array $filters = []) {}

    public function query()
    {
        return app(SupplierPaymentService::class)->getQuery($this->filters);
    }

    public function headings(): array
    {
        return [
            'VOUCHER #',
            'SUPPLIER',
            'AMOUNT',
            'UTILIZED',
            'BALANCE',
            'ACCOUNT',
            'PAYMENT DATE',
            'PAID TO',
            'GLOTs',
        ];
    }

    public function map($row): array
    {
        $utilized = $row->children_sum_amount ?? $row->children()->sum('amount');

        return [
            $row->voucher_number,
            $row->supplier?->name,
            $row->amount,
            $utilized,
            $row->amount - $utilized,
            $row->bankAccount?->holder_name,
            $row->payment_date?->format('Y-m-d'),
            $row->paid_to,
            $row->children->map(fn ($child) => $child->stockPurchase?->batch_number)->filter()->implode(', '),
        ];
    }
}
