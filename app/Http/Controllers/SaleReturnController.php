<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\SaleReturn\DeleteSaleReturnAction;
use App\Actions\SaleReturn\ListSaleReturnsAction;
use App\Actions\SaleReturn\StoreSaleReturnAction;
use App\Actions\SaleReturn\UpdateSaleReturnAction;
use App\Http\Requests\SaleReturn\StoreSaleReturnRequest;
use App\Http\Requests\SaleReturn\UpdateSaleReturnRequest;
use App\Http\Resources\SaleReturn\SaleReturnDetailResource;
use App\Http\Resources\SaleReturn\SaleReturnListResource;
use App\Models\SaleReturn;
use App\Traits\WithActiveFilters;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Response;
use Inertia\ResponseFactory;

class SaleReturnController extends Controller
{
    use WithActiveFilters;

    public function index(Request $request, ListSaleReturnsAction $listSaleReturnsAction)
    {
        abort_if(! auth()->user()->can('manage sale return'), 403);
        $filters = $request->all();

        $returns = $listSaleReturnsAction->execute(
            filters: $filters,
            perPage: (int) $request->input('limit', 15)
        );

        $summaryRow = $listSaleReturnsAction->query($filters)
            ->reorder()
            ->toBase()
            ->selectRaw('SUM(total_amount) as total_amount, SUM(total_refunded) as total_refunded, SUM(total_due) as total_due')
            ->first();

        return inertia('SaleReturn/SaleReturns', [
            'data' => SaleReturnListResource::collection($returns)
                ->additional(array_merge(
                    $this->getActiveFilters($request->all(), ['customer']),
                    ['summary' => [
                        'total_amount' => (float) ($summaryRow->total_amount ?? 0),
                        'total_refunded' => (float) ($summaryRow->total_refunded ?? 0),
                        'total_due' => (float) ($summaryRow->total_due ?? 0),
                    ]]
                )),
        ]);
    }

    public function create(): Response|ResponseFactory
    {
        abort_if(! auth()->user()->can('create sale return'), 403);

        return inertia('SaleReturn/CreateSaleReturn');
    }

    public function store(StoreSaleReturnRequest $request, StoreSaleReturnAction $storeSaleReturnAction)
    {
        abort_if(! auth()->user()->can('create sale return'), 403);
        $result = $storeSaleReturnAction->execute($request->validated());

        $flash = ['success' => __('Sale return created successfully.')];

        if ($result['payment_id'] !== null) {
            $flash['redirect_url'] = '/sale-return-payments/receipt?payment_id='.$result['payment_id'];
        }

        return redirect()->back()->with($flash);
    }

    public function show(SaleReturn $saleReturn, Request $request): SaleReturnDetailResource|Response|ResponseFactory
    {
        abort_if(! auth()->user()->can('manage sale return'), 403);
        $saleReturn->load(['customer', 'items.stock.product.brand', 'items.stock.condition', 'items.stockPurchase', 'payments.bankAccount', 'activity_log']);

        if ($request->expectsJson()) {
            return new SaleReturnDetailResource($saleReturn);
        }

        return inertia('SaleReturn/SaleReturnDetail', ['data' => new SaleReturnDetailResource($saleReturn)]);
    }

    public function edit(SaleReturn $saleReturn): Response|ResponseFactory
    {
        abort_if(! auth()->user()->can('update sale return'), 403);
        $saleReturn->load(['customer', 'items.stock.product.brand', 'items.stock.condition', 'items.stockPurchase']);

        return inertia('SaleReturn/CreateSaleReturn', [
            'saleReturn' => new SaleReturnDetailResource($saleReturn),
        ]);
    }

    public function update(UpdateSaleReturnRequest $request, SaleReturn $saleReturn, UpdateSaleReturnAction $updateSaleReturnAction)
    {
        abort_if(! auth()->user()->can('update sale return'), 403);
        $updateSaleReturnAction->execute($saleReturn, $request->validated());

        return redirect()->back()->with('success', __('Sale return updated successfully.'));
    }

    public function destroy(SaleReturn $saleReturn, DeleteSaleReturnAction $deleteSaleReturnAction)
    {
        abort_if(! auth()->user()->can('delete sale return'), 403);
        try {
            $deleteSaleReturnAction->execute($saleReturn);
        } catch (ValidationException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', __('Sale return deleted successfully.'));
    }
}
