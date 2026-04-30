<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Stock\ListStocksAction;
use App\Exports\StocksExport;
use App\Http\Requests\Stock\ImportImeiReplaceRequest;
use App\Http\Resources\Stock\StockDetailResource;
use App\Http\Resources\Stock\StockListResource;
use App\Imports\ImeiReplaceImport;
use App\Models\Stock;
use App\Traits\WithActiveFilters;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class StockController extends Controller
{
    use WithActiveFilters;

    /**
     * Display a listing of stocks with filtering.
     */
    public function index(Request $request, ListStocksAction $listStocksAction)
    {
        $filters = $request->all();

        $stocks = $listStocksAction->execute(
            filters: $filters,
            perPage: (int) $request->input('limit', 15)
        );

        $summaryRow = $listStocksAction->query($filters)
            ->reorder()
            ->toBase()
            ->selectRaw('SUM(purchase_price) as total_purchase_price, SUM(sale_price) as total_sale_price')
            ->first();

        return inertia('Stock/Stocks', [
            'data' => StockListResource::collection($stocks)
                ->additional(array_merge(
                    $this->getActiveFilters($request->all(), ['product']),
                    ['summary' => [
                        'total_purchase_price' => (float) ($summaryRow->total_purchase_price ?? 0),
                        'total_sale_price' => (float) ($summaryRow->total_sale_price ?? 0),
                    ]]
                )),
        ]);
    }

    /**
     * Export stocks to Excel.
     */
    public function exportExcel(Request $request): BinaryFileResponse
    {
        return Excel::download(new StocksExport($request->all()), 'stocks.xlsx');
    }

    /**
     * Replace IMEI numbers via CSV import.
     */
    public function importImeiReplace(ImportImeiReplaceRequest $request): RedirectResponse
    {
        Excel::import(new ImeiReplaceImport, $request->file('file'));

        return redirect()->back()->with('success', __('IMEI numbers replaced successfully.'));
    }

    /**
     * Display the specified stock.
     */
    public function show(Stock $stock): StockDetailResource
    {
        $stock->load(['product.brand', 'condition', 'stockPurchaseItem.stockPurchase']);

        return new StockDetailResource($stock);
    }
}
