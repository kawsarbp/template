<?php

namespace App\Http\Controllers;

use App\Exports\DailyCashReportExport;
use App\Http\Resources\Report\CashflowReportResource;
use App\Http\Resources\Report\CustomerAdvanceReportResource;
use App\Http\Resources\Report\SalePaymentReportResource;
use App\Http\Resources\Report\StockPurchaseReportResource;
use App\Models\BankAccount;
use App\Services\CashBankService;
use App\Traits\WithActiveFilters;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class CashBankReportController extends Controller
{
    use WithActiveFilters;

    public function __construct(protected CashBankService $service) {}

    public function index(Request $request)
    {
        $data = $this->service->all($request->all());
        $customerAdvances = CustomerAdvanceReportResource::collection($data['customer_advances']);
        $salePayments = SalePaymentReportResource::collection($data['sale_payments']);
        $stockPurchasePayments = StockPurchaseReportResource::collection($data['stock_purchases']);
        $cashflowTransactions = CashflowReportResource::collection($data['cashflow_transactions']);

        return Inertia::render('Report/CashBank/CashBankReport', [
            'customer_advances' => $customerAdvances,
            'sale_payments' => $salePayments,
            'stock_purchases' => $stockPurchasePayments,
            'cashflow_transactions' => $cashflowTransactions,
            'summary' => $data['summary'],
            'formatted_summary' => $data['formatted_summary'],
            'opening_balance' => priceFormat($data['opening_balance'], 0),
            'filters' => $this->getActiveFilters($request->all(), ['bank_account']),
        ]);
    }

    public function exportExcel(Request $request)
    {
        $start = Carbon::parse($request->start_date ?? now())->format('Y-m-d');
        $end = Carbon::parse($request->end_date ?? now())->format('Y-m-d');

        $fileName = 'daily_cash_report_from_'.$start.'_to_'.$end.'.xlsx';

        return Excel::download(new DailyCashReportExport($request->all()), $fileName);
    }

    public function cashBankReportPdf(Request $request)
    {
        $start = Carbon::parse($request->start_date ?? now())->format('Y-m-d');
        $end = Carbon::parse($request->end_date ?? now())->format('Y-m-d');

        $data = $this->service->all($request->all());

        $reportTitle = 'Cash Flow Statement';
        if (! empty($request->bank_account_id)) {
            $bankAccount = BankAccount::find($request->bank_account_id);
            $reportTitle = 'Bank Book - <small>'.$bankAccount->holder_name.'</small>';
        }
        $pdf = Pdf::loadView('report.daily_cash_report_pdf', [
            'summary' => $data['summary'],
            'start' => $start,
            'end' => $end,
            'customerAdvances' => $data['customer_advances'],
            'salePayments' => $data['sale_payments'],
            'stockPurchases' => $data['stock_purchases'],
            'cashflowTransactions' => $data['cashflow_transactions'],
            'openingBalance' => $data['opening_balance'],
            'reportTitle' => $reportTitle,
        ])->setPaper(
            'a4',
            'portrait'
        )->setOptions(['defaultFont' => 'sans-serif'])
            ->setOptions(['isRemoteEnabled' => true]);

        return $pdf->stream('daily_cash_report_from_'.$start.'_to_'.$end.'.pdf');
    }
}
