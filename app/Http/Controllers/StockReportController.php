<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\StockStatus;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockReportController extends Controller
{
    public function stockReport(Request $request): Response
    {
        $status = $request->input('status', '');
        $groupBy = $request->input('group_by', 'model');

        $query = Stock::query()
            ->join('products', 'stocks.product_id', '=', 'products.id')
            ->leftJoin('brands', 'products.brand_id', '=', 'brands.id');

        if ($status !== null && $status !== '') {
            $query->where('stocks.status', $status);
        }

        if ($groupBy === 'model') {
            $rows = (clone $query)
                ->select([
                    'products.id as product_id',
                    DB::raw("COALESCE(brands.name, 'N/A') as brand_name"),
                    DB::raw("COALESCE(products.model, 'N/A') as model_name"),
                    DB::raw('COUNT(*) as total_qty'),
                    DB::raw('SUM(CASE WHEN stocks.status = '.StockStatus::AVAILABLE->value.' THEN 1 ELSE 0 END) as available'),
                    DB::raw('SUM(CASE WHEN stocks.status = '.StockStatus::SOLD->value.' THEN 1 ELSE 0 END) as sold'),
                    DB::raw('SUM(CASE WHEN stocks.status = '.StockStatus::RETURNED->value.' THEN 1 ELSE 0 END) as returned'),
                    DB::raw('SUM(stocks.purchase_price) as total_purchase_value'),
                    DB::raw('SUM(stocks.sale_price) as total_sale_value'),
                ])
                ->groupBy('products.id', 'brands.name', 'products.model')
                ->orderBy('brands.name')
                ->orderBy('products.model')
                ->get();
        } else {
            $rows = (clone $query)
                ->select([
                    'brands.id as brand_id',
                    DB::raw("COALESCE(brands.name, 'N/A') as brand_name"),
                    DB::raw('COUNT(*) as total_qty'),
                    DB::raw('SUM(CASE WHEN stocks.status = '.StockStatus::AVAILABLE->value.' THEN 1 ELSE 0 END) as available'),
                    DB::raw('SUM(CASE WHEN stocks.status = '.StockStatus::SOLD->value.' THEN 1 ELSE 0 END) as sold'),
                    DB::raw('SUM(CASE WHEN stocks.status = '.StockStatus::RETURNED->value.' THEN 1 ELSE 0 END) as returned'),
                    DB::raw('SUM(stocks.purchase_price) as total_purchase_value'),
                    DB::raw('SUM(stocks.sale_price) as total_sale_value'),
                ])
                ->groupBy('brands.id', 'brands.name')
                ->orderBy('brands.name')
                ->get();
        }

        $summary = [
            'total_qty' => $rows->sum('total_qty'),
            'available' => $rows->sum('available'),
            'sold' => $rows->sum('sold'),
            'returned' => $rows->sum('returned'),
            'total_purchase_value' => (float) $rows->sum('total_purchase_value'),
            'total_sale_value' => (float) $rows->sum('total_sale_value'),
        ];

        return Inertia::render('Report/StockReport', [
            'rows' => $rows,
            'summary' => $summary,
            'filters' => [
                'status' => $status,
                'group_by' => $groupBy,
            ],
        ]);
    }
}
