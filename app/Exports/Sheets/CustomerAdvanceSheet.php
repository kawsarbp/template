<?php

namespace App\Exports\Sheets;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithTitle;

class CustomerAdvanceSheet implements FromView, WithTitle
{
    public function __construct(protected $summary, protected $customerAdvances) {}

    public function title(): string
    {
        return 'Customer Advance';
    }

    public function view(): View
    {
        return view('report.sheets.advance_account', [
            'summary' => $this->summary,
            'customerAdvances' => $this->customerAdvances,
        ]);
    }
}
