<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SaleReportController extends Controller
{
    public function salesSummary(Request $request): Response
    {
        $fromDate = $request->input('from_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $toDate = $request->input('to_date', Carbon::now()->format('Y-m-d'));
        $groupBy = $request->input('group_by', 'daily');

        $dateExpr = match ($groupBy) {
            'weekly' => "DATE_FORMAT(sale_date, '%x-W%v')",
            'monthly' => "DATE_FORMAT(sale_date, '%Y-%m')",
            default => "DATE_FORMAT(sale_date, '%Y-%m-%d')",
        };

        $rows = Sale::query()
            ->selectRaw("{$dateExpr} as period")
            ->selectRaw('COUNT(*) as total_sales')
            ->selectRaw('SUM(total_units) as total_units')
            ->selectRaw('SUM(total_amount) as total_amount')
            ->selectRaw('SUM(discount) as total_discount')
            ->selectRaw('SUM(total_due) as total_due')
            ->selectRaw('SUM(total_paid) as total_paid')
            ->whereBetween('sale_date', [$fromDate, $toDate])
            ->groupByRaw("{$dateExpr}")
            ->orderByRaw("{$dateExpr}")
            ->get();

        $summary = [
            'total_sales' => $rows->sum('total_sales'),
            'total_units' => $rows->sum('total_units'),
            'total_amount' => (float) $rows->sum('total_amount'),
            'total_discount' => (float) $rows->sum('total_discount'),
            'total_due' => (float) $rows->sum('total_due'),
            'total_paid' => (float) $rows->sum('total_paid'),
        ];

        return Inertia::render('Report/SalesSummary', [
            'rows' => $rows,
            'summary' => $summary,
            'filters' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'group_by' => $groupBy,
            ],
        ]);
    }

    public function profitReport(Request $request): Response
    {
        $fromDate = $request->input('from_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $toDate = $request->input('to_date', Carbon::now()->format('Y-m-d'));
        $groupBy = $request->input('group_by', 'daily');
        $view = $request->input('view', 'summary');

        $dateExpr = match ($groupBy) {
            'weekly' => "DATE_FORMAT(sales.sale_date, '%x-W%v')",
            'monthly' => "DATE_FORMAT(sales.sale_date, '%Y-%m')",
            default => "DATE_FORMAT(sales.sale_date, '%Y-%m-%d')",
        };

        if ($view === 'items') {
            $rows = SaleItem::query()
                ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
                ->join('stocks', 'sale_items.stock_id', '=', 'stocks.id')
                ->leftJoin('products', 'stocks.product_id', '=', 'products.id')
                ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
                ->select([
                    'sale_items.id',
                    'sales.sale_number',
                    'sales.sale_date',
                    'stocks.imei',
                    DB::raw("CONCAT(COALESCE(brands.name, ''), ' ', COALESCE(products.model, '')) as product_name"),
                    DB::raw('stocks.purchase_price as purchase_price'),
                    DB::raw('sale_items.sale_price as sale_price'),
                    DB::raw('(sale_items.sale_price - stocks.purchase_price) as profit'),
                ])
                ->whereBetween('sales.sale_date', [$fromDate, $toDate])
                ->whereNull('sales.deleted_at')
                ->orderBy('sales.sale_date')
                ->orderBy('sale_items.id')
                ->get();

            $summary = [
                'total_items' => $rows->count(),
                'total_purchase' => (float) $rows->sum('purchase_price'),
                'total_sale' => (float) $rows->sum('sale_price'),
                'total_profit' => (float) $rows->sum('profit'),
            ];
        } else {
            $rows = SaleItem::query()
                ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
                ->join('stocks', 'sale_items.stock_id', '=', 'stocks.id')
                ->selectRaw("{$dateExpr} as period")
                ->selectRaw('COUNT(sale_items.id) as total_items')
                ->selectRaw('SUM(stocks.purchase_price) as total_purchase')
                ->selectRaw('SUM(sale_items.sale_price) as total_sale')
                ->selectRaw('SUM(sale_items.sale_price - stocks.purchase_price) as total_profit')
                ->whereBetween('sales.sale_date', [$fromDate, $toDate])
                ->whereNull('sales.deleted_at')
                ->groupByRaw("{$dateExpr}")
                ->orderByRaw("{$dateExpr}")
                ->get();

            $summary = [
                'total_items' => $rows->sum('total_items'),
                'total_purchase' => (float) $rows->sum('total_purchase'),
                'total_sale' => (float) $rows->sum('total_sale'),
                'total_profit' => (float) $rows->sum('total_profit'),
            ];
        }

        return Inertia::render('Report/ProfitReport', [
            'rows' => $rows,
            'summary' => $summary,
            'filters' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'group_by' => $groupBy,
                'view' => $view,
            ],
        ]);
    }
}
