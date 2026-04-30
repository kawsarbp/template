<?php

namespace App\Exports\Sheets;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithTitle;

class SalePaymentSheet implements FromView, WithTitle
{
    public function __construct(protected $summary, protected $salePayments) {}

    public function title(): string
    {
        return 'Sale Payment';
    }

    public function view(): View
    {
        return view('report.sheets.sale', [
            'summary' => $this->summary,
            'salePayments' => $this->salePayments,
        ]);
    }
}
