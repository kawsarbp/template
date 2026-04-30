<?php

namespace App\Exports;

use App\Exports\Sheets\CashFlowPaymentSheet;
use App\Exports\Sheets\CashReportSummarySheet;
use App\Exports\Sheets\CustomerAdvanceSheet;
use App\Exports\Sheets\SalePaymentSheet;
use App\Exports\Sheets\StockPurchasePaymentSheet;
use App\Services\CashBankService;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class DailyCashReportExport implements WithMultipleSheets
{
    /**
     * ConsigneesExport constructor.
     */
    public function __construct(protected array $filters) {}

    public function sheets(): array
    {
        $data = app(CashBankService::class)->all($this->filters);

        $sheets[] = new CashReportSummarySheet($data['summary'], ['isCashBank' => true]);
        $sheets[] = new CustomerAdvanceSheet($data['summary'], $data['customer_advances']);
        $sheets[] = new SalePaymentSheet($data['summary'], $data['sale_payments']);
        $sheets[] = new StockPurchasePaymentSheet($data['summary'], $data['stock_purchases']);
        $sheets[] = new CashFlowPaymentSheet($data['summary'], $data['cashflow_transactions']);

        return $sheets;
    }
}
