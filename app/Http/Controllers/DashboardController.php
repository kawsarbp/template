<?php

namespace App\Http\Controllers;

use App\Actions\Stock\ListStockPurchasesAction;
use App\Enums\StockStatus;
use App\Models\Sale;
use App\Models\Stock;
use App\Models\StockPurchase;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        return inertia('DashboardHome', [
            'summary' => [
                'today_sale' => priceFormat((float) Sale::query()->where('sale_date', today())->selectRaw('SUM(total_amount - discount) as total')->value('total') ?? 0, 0),
                'today_sale_qty' => Sale::query()->where('sale_date', today())->sum('total_units'),
                'today_purchase' => priceFormat((float) StockPurchase::query()->where('purchase_date', today())->selectRaw('SUM(total_amount - discount) as total')->value('total') ?? 0, 0),
                'today_purchase_qty' => StockPurchase::query()->where('purchase_date', today())->sum('total_units'),
                'available_stock' => Stock::query()->where('status', StockStatus::AVAILABLE)->count(),
                'outstanding_balance' => priceFormat((float) Sale::query()->sum('total_due'), 0),
            ],

            'performance_overview' => app(ListStockPurchasesAction::class)->monthlyReport(),
        ]);
    }

    public function stockPurchaseSummary(Request $request)
    {
        return app(ListStockPurchasesAction::class)->stockPurchaseSummary($request->all());
    }
}
