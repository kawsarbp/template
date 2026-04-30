<?php

namespace App\Http\Controllers;

use App\Exports\CustomerAdvanceHistoryExport;
use App\Http\Resources\AdvanceAccount\CustomerAdvanceReport;
use App\Models\AdvancedAccount;
use App\Models\Customer;
use App\Traits\WithActiveFilters;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdvanceAccountReportController extends Controller
{
    use WithActiveFilters;

    public function customerAdvancedReport(Request $request)
    {
        $customerReport = [];
        $customerName = null;
        $summary = [
            'total_received' => 0,
            'advance_utilized' => 0,
            'total_balance' => 0,
        ];

        if (! empty($request->customer_id)) {
            $customerName = Customer::query()->find($request->customer_id)->name;

            $advanceAccounts = AdvancedAccount::with('bank_account')
                ->where('customer_id', $request->customer_id)
                ->orderBy('date')
                ->get();

            $balance = 0;
            foreach ($advanceAccounts as $key => $account) {
                $balance += $account->amount;
                $advanceAccounts[$key]->balance = $balance;
                // $account->balance = $balance;
            }

            $summary['total_received'] = $advanceAccounts->where('amount', '>', 0)->sum('amount');
            $summary['advance_utilized'] = abs($advanceAccounts->where('amount', '<', 0)->sum('amount'));
            $summary['total_balance'] = $advanceAccounts->sum('amount');

            $customerReport = CustomerAdvanceReport::collection(
                $advanceAccounts->reverse()->values()
            )->additional($this->getActiveFilters($request->all(), ['customer']));
        }

        return Inertia::render('AdvanceReport/AdvanceReport', [
            'customerReport' => $customerReport,
            'customerName' => $customerName,
            'summary' => [
                'total_received' => priceFormat($summary['total_received']),
                'advance_utilized' => priceFormat($summary['advance_utilized']),
                'total_balance' => priceFormat($summary['total_balance']),
            ],
        ]);
    }

    public function customerAdvancedReportPdf(Request $request): Response
    {
        $customerReport = [];
        $customerName = '';
        if (! empty($request->customer_id)) {
            $customerName = Customer::find($request->customer_id)->first()->name;
            $customerReport = AdvancedAccount::with('bank_account')
                ->where('customer_id', $request->customer_id)
                ->orderby('date')
                ->get();
            $balance = 0;
            foreach ($customerReport as $key => $account) {
                $balance += $account->amount;
                $customerReport[$key]->balance = $balance;
            }
            $customerReport = $customerReport->reverse()->values();
        }

        $pdf = Pdf::loadView(
            'advance_account.customer_advanced_report',
            compact('customerReport', 'customerName')
        )->setPaper(
            'a4',
            'portrait'
        )->setOptions(['defaultFont' => 'sans-serif']);

        return $pdf->stream();
    }

    public function customerAdvancedReportExport(Request $request): BinaryFileResponse|RedirectResponse
    {
        if (empty($request->customer_id)) {
            return redirect()->back()->with('error', 'Please select customer.');
        }
        $customerName = Customer::find($request->customer_id)->firstOrFail()->name;
        $fileName = str_replace(' ', '_', $customerName).'_advance_payments.xlsx';

        return Excel::download(new CustomerAdvanceHistoryExport($request->customer_id), $fileName);
    }
}
