<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\SupplierPayment\DeleteSupplierPaymentAction;
use App\Actions\SupplierPayment\StoreSupplierPaymentAction;
use App\Actions\SupplierPayment\UpdateSupplierPaymentAction;
use App\Exports\SupplierPaymentsExport;
use App\Http\Requests\SupplierPayment\StoreSupplierPaymentRequest;
use App\Http\Requests\SupplierPayment\UpdateSupplierPaymentRequest;
use App\Http\Resources\SupplierPayment\SupplierPaymentEditResource;
use App\Http\Resources\SupplierPayment\SupplierPaymentResource;
use App\Models\StockPurchasePayment;
use App\Services\SupplierPaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SupplierPaymentController extends Controller
{
    public static function middleware(): array
    {
        return [
            new Middleware('role_or_permission:owner|export excel supplier payment', only: ['exportExcel']),
        ];
    }

    public function index(Request $request, SupplierPaymentService $service): Response
    {
        $filters = $request->all();

        $baseQuery = $service->getQuery($filters);

        $totalAmount = (float) (clone $baseQuery)->sum('stock_purchase_payments.amount');
        $totalUtilized = (float) StockPurchasePayment::query()
            ->whereIn('parent_id', (clone $baseQuery)->select('stock_purchase_payments.id'))
            ->sum('amount');

        return inertia('SupplierPayment/Index', [
            'data' => SupplierPaymentResource::collection(
                $service->getFiltered($filters, $request->integer('limit', 50))
            )->additional([
                'summary' => [
                    'total_amount' => $totalAmount,
                    'total_utilized' => $totalUtilized,
                    'total_balance' => $totalAmount - $totalUtilized,
                ],
            ]),
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        return inertia('SupplierPayment/Create');
    }

    public function store(StoreSupplierPaymentRequest $request, StoreSupplierPaymentAction $action): RedirectResponse
    {
        $payment = $action->execute($request->validated());

        return redirect('/supplier-payments')->with([
            'success' => __('Supplier payment added successfully.'),
            'redirect_url' => '/stock-purchases/multi-payment-receipt?payment_id='.$payment->id,
        ]);
    }

    public function edit(StockPurchasePayment $supplierPayment): Response
    {
        $supplierPayment->load(['supplier', 'bankAccount', 'children.stockPurchase']);

        return inertia('SupplierPayment/Edit', [
            'payment' => (new SupplierPaymentEditResource($supplierPayment))->resolve(),
        ]);
    }

    public function update(StockPurchasePayment $supplierPayment, UpdateSupplierPaymentRequest $request, UpdateSupplierPaymentAction $action): RedirectResponse
    {
        $action->execute($supplierPayment, $request->validated());

        return redirect('/supplier-payments')->with('success', __('Supplier payment updated successfully.'));
    }

    public function destroy(StockPurchasePayment $supplierPayment, DeleteSupplierPaymentAction $action): RedirectResponse
    {
        $action->execute($supplierPayment);

        return redirect('/supplier-payments')->with('success', __('Supplier payment deleted successfully.'));
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        return Excel::download(new SupplierPaymentsExport($request->all()), 'supplier-payments.xlsx');
    }
}
