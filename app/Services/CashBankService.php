<?php

namespace App\Services;

use App\Enums\CashflowType;
use App\Enums\Currency;
use App\Models\AdvancedAccount;
use App\Models\BankAccount;
use App\Models\CashflowTransaction;
use App\Models\SalePayment;
use App\Models\StockPurchasePayment;
use Illuminate\Support\Carbon;

class CashBankService
{
    public function all($filters = [])
    {
        $start = Carbon::parse($filters['start_date'] ?? now())->format('Y-m-d');
        $end = Carbon::parse($filters['end_date'] ?? now())->format('Y-m-d');

        $customerAdvances = AdvancedAccount::with(['customer'])
            ->withoutNonCash()
            ->whereBetween('date', [$start, $end])
            ->when(! empty($filters['bank_account_id']), function ($query) use ($filters) {
                $query->where('bank_account_id', $filters['bank_account_id']);
            })->orderby('date', 'desc')
            ->get();

        $salePayments = SalePayment::with(['sale.customer'])
            ->withoutNonCash()
            ->whereBetween('payment_date', [$start, $end])
            ->when(! empty($filters['bank_account_id']), function ($query) use ($filters) {
                $query->where('bank_account_id', $filters['bank_account_id']);
            })->orderby('payment_date', 'desc')
            ->get();

        $stockPurchasePayments = StockPurchasePayment::with(['stockPurchase', 'children.stockPurchase'])
            ->withoutNonCash()
            ->whereNull('parent_id')
            ->whereBetween('payment_date', [$start, $end])
            ->when(! empty($filters['bank_account_id']), function ($query) use ($filters) {
                $query->where('bank_account_id', $filters['bank_account_id']);
            })->orderby('payment_date', 'desc')
            ->get();

        $cashflowTransactions = CashflowTransaction::query()
            ->withoutNonCash()
            ->whereBetween('date', [$start, $end])
            ->when(! empty($filters['bank_account_id']), function ($q) use ($filters) {
                $q->where('bank_account_id', $filters['bank_account_id']);
            })->orderby('date', 'desc')
            ->get();

        $summary = [
            'total_advance_debit' => $customerAdvances->where('amount', '>', 0)->sum('amount'),
            'total_advance_credit' => abs($customerAdvances->where('amount', '<', 0)->sum('amount')),

            'total_sale_debit' => abs($salePayments->where('amount', '>', 0)->sum('amount')),
            'total_sale_credit' => abs($salePayments->where('amount', '<', 0)->sum('amount')),

            'total_stock_purchase_debit' => 0,
            'total_stock_purchase_credit' => $stockPurchasePayments->sum('amount'),
            'total_cashflow_debit' => abs($cashflowTransactions->where('type', CashflowType::CASH_IN)->sum('amount')),
            'total_cashflow_credit' => abs($cashflowTransactions->where('type', CashflowType::CASH_OUT)->sum('amount')),
        ];

        $openingBalance = $this->getOpeningBalance($start, ! empty($filters['bank_account_id']) ? $filters['bank_account_id'] : null);
        $summary['total_debit'] = $summary['total_advance_debit'] + $summary['total_sale_debit'] + $summary['total_stock_purchase_debit'] + $summary['total_cashflow_debit'];
        $summary['total_credit'] = $summary['total_advance_credit'] + $summary['total_sale_credit'] + $summary['total_stock_purchase_credit'] + $summary['total_cashflow_credit'];
        $summary['closing_balance'] = $openingBalance + ($summary['total_debit'] - $summary['total_credit']);
        $summary['opening_balance'] = $openingBalance;

        $formattedSummary = collect($summary)->map(function ($item) {
            return priceFormat($item, 0);
        });

        return [
            'customer_advances' => $customerAdvances,
            'sale_payments' => $salePayments,
            'stock_purchases' => $stockPurchasePayments,
            'cashflow_transactions' => $cashflowTransactions,
            'summary' => $summary,
            'formatted_summary' => $formattedSummary,
            'opening_balance' => $openingBalance,
        ];
    }

    public function getOpeningBalance($date, $accountId = null)
    {
        $openingBalance = BankAccount::query()
            ->when($accountId, function ($q) use ($accountId) {
                $q->where('id', $accountId);
            })->sum('opening_balance');

        // sale payment
        $openingBalance += SalePayment::with(['sale.customer'])
            ->withoutNonCash()
            ->where('payment_date', '<', $date)
            ->when($accountId, function ($query) use ($accountId) {
                $query->where('bank_account_id', $accountId);
            })->sum('amount');

        // cashflow transaction
        $openingBalance += CashflowTransaction::query()
            ->withoutNonCash()
            ->where('type', CashflowType::CASH_IN)
            ->where('date', '<', $date)
            ->when($accountId, function ($q) use ($accountId) {
                $q->where('bank_account_id', $accountId);
            })->sum('amount');

        $openingBalance -= CashflowTransaction::query()
            ->withoutNonCash()
            ->where('type', CashflowType::CASH_OUT)
            ->where('date', '<', $date)
            ->when($accountId, function ($q) use ($accountId) {
                $q->where('bank_account_id', $accountId);
            })->sum('amount');

        // stock purchase payment
        $openingBalance -= StockPurchasePayment::with(['stockPurchase.supplier'])
            ->withoutNonCash()
            ->whereNull('parent_id')
            ->where('payment_date', '<', $date)
            ->when($accountId, function ($q) use ($accountId) {
                $q->where('bank_account_id', $accountId);
            })->sum('amount');

        // advance payment
        $openingBalance += AdvancedAccount::query()
            ->where('date', '<', $date)
            ->withoutNonCash()
            ->where('amount', '>', 0)
            ->when($accountId, function ($q) use ($accountId) {
                $q->where('bank_account_id', $accountId);
            })
            ->sum('amount');

        $openingBalance -= abs(
            AdvancedAccount::query()
                ->where('date', '<', $date)
                ->where('amount', '<', 0)
                ->withoutNonCash()
                ->when(! empty($accountId), function ($q) use ($accountId) {
                    $q->where('bank_account_id', $accountId);
                })
                ->sum('amount')
        );

        return $openingBalance;
    }
}
