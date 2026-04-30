<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Enums\StockStatus;
use App\Enums\VisibilityStatus;
use App\Models\BankAccount;
use App\Models\Brand;
use App\Models\Color;
use App\Models\Condition;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Stock;
use App\Models\StockPurchase;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class SearchController extends Controller
{
    public function searchRole(Request $request): JsonResponse
    {
        $query = Role::select([
            DB::raw('id AS value'),
            DB::raw('name AS label'),
        ]);
        if (! empty($request->search)) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        return response()->json(['data' => $query->limit(20)->get()]);
    }

    public function searchUser(Request $request): JsonResponse
    {
        $query = User::select([
            DB::raw('id AS value'),
            DB::raw('name AS label'),
        ])->where('status', VisibilityStatus::ACTIVE->value);

        if (! empty($request->search)) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $query->orderBy($request->get('sort_by', 'name'), $request->get('sort_direction', 'asc'));

        return response()->json(['data' => $query->limit(20)->get()]);
    }

    public function searchCustomer(Request $request): JsonResponse
    {
        $query = Customer::select([
            DB::raw('id AS value'),
            DB::raw('name AS label'),
        ])->active();

        if (! empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });
        }

        $query->orderBy($request->get('sort_by', 'name'), $request->get('sort_direction', 'asc'));

        return response()->json(['data' => $query->limit(20)->get()]);
    }

    public function searchSupplier(Request $request): JsonResponse
    {
        $query = Supplier::select([
            DB::raw('id AS value'),
            DB::raw('name AS label'),
            'currency',
        ])->active();

        if (! empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });
        }

        $query->orderBy($request->get('sort_by', 'name'), $request->get('sort_direction', 'asc'));

        return response()->json(['data' => $query->limit(20)->get()]);
    }

    public function searchBrand(Request $request): JsonResponse
    {
        $query = Brand::select([
            DB::raw('id AS value'),
            DB::raw('name AS label'),
        ])->active();

        if (! empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });
        }

        $query->orderBy($request->get('sort_by', 'name'), $request->get('sort_direction', 'asc'));

        return response()->json(['data' => $query->limit(20)->get()]);
    }

    public function searchColor(Request $request): JsonResponse
    {
        $query = Color::select([
            DB::raw('id AS value'),
            DB::raw('name AS label'),
        ])->active();

        if (! empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });
        }

        $query->orderBy($request->get('sort_by', 'name'), $request->get('sort_direction', 'asc'));

        return response()->json(['data' => $query->limit(20)->get()]);
    }

    public function searchCondition(Request $request): JsonResponse
    {
        $query = Condition::select([
            DB::raw('id AS value'),
            DB::raw('name AS label'),
        ])->active();

        if (! empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });
        }

        $query->orderBy($request->get('sort_by', 'id'), $request->get('sort_direction', 'asc'));

        return response()->json(['data' => $query->limit(20)->get()]);
    }

    public function searchProduct(Request $request): JsonResponse
    {
        $query = Product::query()
            ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
            ->select([
                DB::raw('products.id AS value'),
                DB::raw("CONCAT(COALESCE(brands.name, ''), ' ', products.model, ' - ', products.title) AS label"),
            ]);

        if (! empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('products.title', 'like', "%{$request->search}%")
                    ->orWhere('brands.name', 'like', "%{$request->search}%")
                    ->orWhere('products.model', 'like', "%{$request->search}%");
            });
        }

        return response()->json(['data' => $query->limit(20)->get()]);
    }

    public function searchBankAccount(Request $request): JsonResponse
    {
        $query = BankAccount::select([
            DB::raw('id AS value'),
            DB::raw('holder_name AS label'),
        ]);
        if ($request->boolean('with_out_non_cash')) {
            $query->where('id', '!=', BankAccount::NON_CASH_ID);
        }
        if (! empty($request->search)) {
            $query->where('holder_name', 'like', "%{$request->search}%");
        }

        return response()->json(['data' => $query->limit(20)->get()]);
    }

    public function searchStock(Request $request): JsonResponse
    {
        $query = Stock::query()
            ->where('stocks.status', StockStatus::AVAILABLE)
            ->leftJoin('products', 'stocks.product_id', '=', 'products.id')
            ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
            ->select([
                DB::raw('stocks.id AS value'),
                DB::raw("CONCAT(COALESCE(stocks.imei, 'N/A'), ' - ', COALESCE(brands.name, ''), ' ', products.model) AS label"),
                'stocks.sale_price',
                'stocks.purchase_price',
                'stocks.imei',
            ]);

        if (! empty($request->imei_exact)) {
            $query->where('stocks.imei', $request->imei_exact);

            return response()->json(['data' => $query->limit(1)->get()]);
        }

        if (! empty($request->stock_purchase_id)) {
            $query->join('stock_purchase_items', 'stocks.stock_purchase_item_id', '=', 'stock_purchase_items.id')
                ->where('stock_purchase_items.stock_purchase_id', $request->stock_purchase_id);
        }

        if (! empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('stocks.imei', 'like', "%{$request->search}%")
                    ->orWhere('brands.name', 'like', "%{$request->search}%")
                    ->orWhere('products.model', 'like', "%{$request->search}%")
                    ->orWhere('products.title', 'like', "%{$request->search}%");
            });
        }

        $limit = min((int) $request->input('limit', 20), 500);

        return response()->json(['data' => $query->limit($limit)->get()]);
    }

    public function searchSaleItems(Request $request): JsonResponse
    {
        if (empty($request->search)) {
            return response()->json(['data' => []]);
        }

        $search = $request->search;

        // Query 1: Available stocks by IMEI, brand, model
        $stocks = Stock::query()
            ->where('stocks.status', StockStatus::AVAILABLE)
            ->leftJoin('products', 'stocks.product_id', '=', 'products.id')
            ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
            ->where(function ($q) use ($search) {
                $q->where('stocks.imei', 'like', "%{$search}%")
                    ->orWhere('brands.name', 'like', "%{$search}%")
                    ->orWhere('products.model', 'like', "%{$search}%")
                    ->orWhere('products.title', 'like', "%{$search}%");
            })
            ->select([
                DB::raw('stocks.id AS value'),
                DB::raw("CONCAT(COALESCE(stocks.imei, 'N/A'), ' - ', COALESCE(brands.name, ''), ' ', products.model) AS label"),
                'stocks.sale_price',
                'stocks.purchase_price',
                'stocks.imei',
            ])
            ->limit(10)
            ->get()
            ->map(fn ($item) => array_merge($item->toArray(), ['type' => 'stock']));

        // Query 2: GLOT batches by batch_number with available count > 0
        $glots = StockPurchase::query()
            ->select([
                DB::raw('stock_purchases.id AS value'),
                DB::raw('stock_purchases.batch_number AS label'),
            ])
            ->selectSub(
                Stock::query()
                    ->selectRaw('COUNT(*)')
                    ->join('stock_purchase_items', 'stocks.stock_purchase_item_id', '=', 'stock_purchase_items.id')
                    ->whereColumn('stock_purchase_items.stock_purchase_id', 'stock_purchases.id')
                    ->where('stocks.status', StockStatus::AVAILABLE)
                    ->whereNull('stocks.deleted_at'),
                'available_count'
            )
            ->where('batch_number', 'like', "%{$search}%")
            ->having('available_count', '>', 0)
            ->limit(5)
            ->get()
            ->map(fn ($item) => array_merge($item->toArray(), ['type' => 'glot']));

        return response()->json(['data' => $stocks->concat($glots)->values()]);
    }

    public function searchSoldStocks(Request $request): JsonResponse
    {
        $baseStockQuery = Stock::query()
            ->where('stocks.status', StockStatus::SOLD)
            ->leftJoin('products', 'stocks.product_id', '=', 'products.id')
            ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
            ->select([
                DB::raw('stocks.id AS value'),
                DB::raw("CONCAT(COALESCE(stocks.imei, 'N/A'), ' - ', COALESCE(brands.name, ''), ' ', products.model) AS label"),
                'stocks.sale_price',
                'stocks.purchase_price',
                'stocks.imei',
            ]);

        if (! empty($request->imei_exact)) {
            $result = (clone $baseStockQuery)->where('stocks.imei', $request->imei_exact)->limit(1)->get();

            return response()->json(['data' => $result]);
        }

        if (! empty($request->stock_purchase_id)) {
            $result = (clone $baseStockQuery)
                ->join('stock_purchase_items', 'stocks.stock_purchase_item_id', '=', 'stock_purchase_items.id')
                ->where('stock_purchase_items.stock_purchase_id', $request->stock_purchase_id)
                ->limit(500)
                ->get();

            return response()->json(['data' => $result]);
        }

        if (empty($request->search)) {
            return response()->json(['data' => []]);
        }

        $search = $request->search;

        $stocks = (clone $baseStockQuery)
            ->where(function ($q) use ($search) {
                $q->where('stocks.imei', 'like', "%{$search}%")
                    ->orWhere('brands.name', 'like', "%{$search}%")
                    ->orWhere('products.model', 'like', "%{$search}%")
                    ->orWhere('products.title', 'like', "%{$search}%");
            })
            ->limit(10)
            ->get()
            ->map(fn ($item) => array_merge($item->toArray(), ['type' => 'stock']));

        $glots = StockPurchase::query()
            ->select([
                DB::raw('stock_purchases.id AS value'),
                DB::raw('stock_purchases.batch_number AS label'),
            ])
            ->selectSub(
                Stock::query()
                    ->selectRaw('COUNT(*)')
                    ->join('stock_purchase_items', 'stocks.stock_purchase_item_id', '=', 'stock_purchase_items.id')
                    ->whereColumn('stock_purchase_items.stock_purchase_id', 'stock_purchases.id')
                    ->where('stocks.status', StockStatus::SOLD)
                    ->whereNull('stocks.deleted_at'),
                'sold_count'
            )
            ->where('batch_number', 'like', "%{$search}%")
            ->having('sold_count', '>', 0)
            ->limit(5)
            ->get()
            ->map(fn ($item) => array_merge($item->toArray(), ['type' => 'glot']));

        return response()->json(['data' => $stocks->concat($glots)->values()]);
    }

    public function searchSupplierPurchases(Request $request): JsonResponse
    {
        $query = StockPurchase::query()
            ->select([
                DB::raw('stock_purchases.id AS value'),
                DB::raw('stock_purchases.batch_number AS label'),
                'stock_purchases.total_amount',
                'stock_purchases.total_due',
                'stock_purchases.total_paid',
                'stock_purchases.discount',
            ])
            ->whereIn('payment_status', [
                PaymentStatus::UNPAID->value,
                PaymentStatus::PARTIAL->value,
            ]);

        if (! empty($request->exclude_ids)) {
            $query->whereNotIn('id', is_array($request->exclude_ids) ? $request->exclude_ids : explode(',', $request->exclude_ids));
        }

        if (! empty($request->supplier_id)) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if (! empty($request->search)) {
            $query->where('batch_number', 'like', "%{$request->search}%");
        }

        return response()->json(['data' => $query->limit(20)->get()]);
    }

    public function searchStockPurchaseBatch(Request $request): JsonResponse
    {
        $query = StockPurchase::query()
            ->select([
                DB::raw('stock_purchases.id AS value'),
                DB::raw('stock_purchases.batch_number AS label'),
            ])
            ->selectSub(
                Stock::query()
                    ->selectRaw('COUNT(*)')
                    ->join('stock_purchase_items', 'stocks.stock_purchase_item_id', '=', 'stock_purchase_items.id')
                    ->whereColumn('stock_purchase_items.stock_purchase_id', 'stock_purchases.id')
                    ->where('stocks.status', StockStatus::AVAILABLE)
                    ->whereNull('stocks.deleted_at'),
                'available_count'
            );

        if (! empty($request->search)) {
            $query->where('batch_number', 'like', "%{$request->search}%");
        }

        $query->having('available_count', '>', 0);

        return response()->json(['data' => $query->limit(20)->get()]);
    }
}
