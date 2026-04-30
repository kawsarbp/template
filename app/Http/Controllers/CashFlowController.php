<?php

namespace App\Http\Controllers;

use App\Actions\Cashflow\DeleteCashflowAction;
use App\Actions\Cashflow\ListCashflowAction;
use App\Actions\Cashflow\StoreCashflowAction;
use App\Actions\Cashflow\UpdateCashflowAction;
use App\Http\Requests\Cashflow\StoreCashflowRequest;
use App\Http\Requests\Cashflow\UpdateCashflowRequest;
use App\Http\Resources\Cashflow\CashflowDetailResource;
use App\Http\Resources\Cashflow\CashflowListResource;
use App\Models\CashflowTransaction;
use App\Traits\WithActiveFilters;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Response;
use Inertia\ResponseFactory;
use niklasravnsborg\LaravelPdf\Facades\Pdf;

class CashFlowController extends Controller
{
    use WithActiveFilters;

    /**
     * @return Response|ResponseFactory
     */
    public function index(Request $request, ListCashflowAction $listCashflowAction)
    {
        $filters = $request->all();

        $cashflow = $listCashflowAction->execute(
            filters: $filters,
            perPage: (int) $request->input('limit', 15)
        );

        return inertia('CashFlow/CashFlows', [
            'data' => CashflowListResource::collection($cashflow)->additional(
                $this->getActiveFilters($request->all(), ['bank_account'])
            ),
        ]);
    }

    /**
     * @return RedirectResponse
     */
    public function store(StoreCashflowRequest $request, StoreCashflowAction $storeCashflowAction)
    {
        $data = $storeCashflowAction->execute($request->validated());

        return redirect()->back()->with([
            'success' => __('CashFlow added successfully.'),
            'redirect_url' => url('cashflow-transactions-print-receipt-pdf', $data->id),
        ]);
    }

    public function show(CashflowTransaction $cashflowTransaction, Request $request): CashflowDetailResource|Response|ResponseFactory
    {
        if ($request->expectsJson()) {
            return new CashflowDetailResource($cashflowTransaction);
        }

        return inertia('CashflowTransaction/CashflowTransactionDetail', ['data' => new CashflowDetailResource($cashflowTransaction)]);
    }

    /**
     * @return RedirectResponse
     */
    public function update(UpdateCashflowRequest $request, CashflowTransaction $cashflowTransaction, UpdateCashflowAction $updateCashflowAction)
    {
        $updateCashflowAction->execute($cashflowTransaction, $request->validated());

        return redirect()->back()->with('success', __('Cashflow updated successfully.'));
    }

    /**
     * @return RedirectResponse
     */
    public function destroy(CashflowTransaction $cashflowTransaction, DeleteCashflowAction $deleteCashflowAction)
    {
        $deleteCashflowAction->execute($cashflowTransaction);

        return redirect()->back()->with('success', __('Cashflow deleted successfully.'));
    }

    public function cashflowPrintReceiptPdf($id)
    {
        $cashflowTransaction = CashflowTransaction::findOrFail($id);

        try {
            $pdf = Pdf::loadView(
                'cashflow.cash_receipt_pdf',
                compact('cashflowTransaction'),
                [],
                [
                    'format' => 'A4',
                    'defaultFont' => 'sans-serif',
                    'curlAllowUnsafeSslRequests' => true,
                    'showImageErrors' => true,
                ]
            );

            return $pdf->stream('cashflow-transaction.pdf');
        } catch (\Exception $e) {
            Log::info($e->getMessage());

            return response()->json(['error' => 'Something Wrong.'.$e->getMessage()]);
        }
    }
}
