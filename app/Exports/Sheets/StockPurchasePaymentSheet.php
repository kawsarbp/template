<?php

namespace App\Exports\Sheets;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithTitle;

class StockPurchasePaymentSheet implements FromView, WithTitle
{
    public function __construct(protected $summary, protected $stockPurchases) {}

    public function title(): string
    {
        return 'Stock Purchases';
    }

    public function view(): View
    {
        return view('report.sheets.stock_purchase', [
            'summary' => $this->summary,
            'stockPurchases' => $this->stockPurchases,
        ]);
    }
}
