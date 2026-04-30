<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class CashReportSummarySheet implements FromArray, WithHeadings, WithMapping, WithTitle
{
    public function __construct(protected $summary, protected $isCashBank) {}

    public function title(): string
    {
        return 'ReportSummary';
    }

    public function array(): array
    {
        $summary = [
            [
                'type' => 'Sale',
                'debit' => priceFormat($this->summary['total_sale_debit']),
                'credit' => priceFormat($this->summary['total_sale_credit']),
            ],
            [
                'type' => 'Stock Purchase',
                'debit' => priceFormat($this->summary['total_stock_purchase_debit']),
                'credit' => priceFormat($this->summary['total_stock_purchase_credit']),
            ],
            [
                'type' => 'Advance Account',
                'debit' => priceFormat($this->summary['total_advance_debit']),
                'credit' => priceFormat($this->summary['total_advance_credit']),
            ],
            [
                'type' => 'Cashflow',
                'debit' => priceFormat($this->summary['total_cashflow_debit']),
                'credit' => priceFormat($this->summary['total_cashflow_credit']),
            ],
            ['type' => '', 'debit' => '', 'credit' => ''],
            ['type' => '', 'debit' => '', 'credit' => ''],
        ];
        if ($this->isCashBank['isCashBank'] == true) {
            $summary = array_merge($summary, [
                ['type' => 'Opening Balance', 'debit' => '', 'credit' => priceFormat($this->summary['opening_balance'])],
                ['type' => 'Closing Balance', 'debit' => '', 'credit' => priceFormat($this->summary['closing_balance'])],
            ]);
        }

        return $summary;
    }

    public function headings(): array
    {
        return [
            'Type',
            'Total Debit',
            'Total Credit',
        ];
    }

    public function map($row): array
    {
        return [
            $row['type'],
            $row['debit'],
            $row['credit'],
        ];
    }
}
