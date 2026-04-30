<?php

namespace App\Exports\Sheets;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithTitle;

class CashFlowPaymentSheet implements FromView, WithTitle
{
    public function __construct(protected $summary, protected $cashflowTransactions) {}

    public function title(): string
    {
        return 'CashflowTransaction';
    }

    public function view(): View
    {
        return view('report.sheets.cashflow', [
            'summary' => $this->summary,
            'cashflowTransactions' => $this->cashflowTransactions,
        ]);
    }
}
