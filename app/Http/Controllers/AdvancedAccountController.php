<?php

namespace App\Http\Controllers;

use App\Actions\AdvanceAccount\AdvanceAccountListAction;
use App\Actions\AdvanceAccount\DeleteAdvanceAccountAction;
use App\Actions\AdvanceAccount\ListAdvanceAccountsAction;
use App\Actions\AdvanceAccount\ShowAdvanceAccountAction;
use App\Actions\AdvanceAccount\StoreAdvanceAccountAction;
use App\Actions\AdvanceAccount\UpdateAdvanceAccountAction;
use App\Exports\CustomerAdvancePaymentExport;
use App\Http\Requests\AdvanceAccount\StoreAdvanceAccountRequest;
use App\Http\Requests\AdvanceAccount\UpdateAdvanceAccountRequest;
use App\Http\Resources\AdvanceAccount\AdvanceAccountDetailResource;
use App\Http\Resources\AdvanceAccount\AdvanceAccountListResource;
use App\Http\Resources\AdvanceAccount\AdvanceAccountResource;
use App\Models\AdvancedAccount;
use App\Models\Customer;
use App\Traits\WithActiveFilters;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Response;
use Inertia\ResponseFactory;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Exception;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdvancedAccountController extends Controller
{
    use WithActiveFilters;

    public static function middleware(): array
    {
        return [
            new Middleware('role_or_permission:owner|manage advance account', only: ['index']),
            new Middleware('role_or_permission:owner|manage advance account', only: ['advanceAccountList']),
            new Middleware('role_or_permission:owner|create advance account', only: ['store']),
            new Middleware('role_or_permission:owner|update advance account', only: ['update']),
            new Middleware('role_or_permission:owner|view advance account', only: ['show']),
            new Middleware('role_or_permission:owner|delete advance account', only: ['destroy']),
            new Middleware('role_or_permission:owner|export excel advance account', only: ['exportExcel']),
            new Middleware('role_or_permission:owner|pdf export advance account', only: ['exportPdf']),
        ];
    }

    /**
     * @return Response|ResponseFactory
     */
    public function index(Request $request, ListAdvanceAccountsAction $listAdvanceAccountsAction)
    {
        $filters = $this->getActiveFilters($request->all(), ['customer']);
        $filters['summary'] = $listAdvanceAccountsAction->getAdvanceSummary($request->all());

        $advanceAccounts = $listAdvanceAccountsAction->execute(
            filters: $request->all(),
            perPage: (int) $request->input('limit', 15)
        );

        return inertia('CustomerAdvance/CustomerAdvance', [
            'data' => AdvanceAccountResource::collection($advanceAccounts)
                ->additional($filters),
        ]);
    }

    /**
     * @param  ListAdvanceAccountsAction  $listAdvanceAccountsAction
     */
    public function advanceAccountList(Request $request, $id, AdvanceAccountListAction $advanceAccountListAction): Response|ResponseFactory
    {
        $data = AdvanceAccountListResource::collection(
            $advanceAccountListAction->execute(array_merge($request->all(), ['customer_id' => $id]))
        )->additional($this->getActiveFilters($request->all(), ['bank_account']));

        return inertia('CustomerAdvance/CustomerAdvanceDetail', ['data' => $data]);
    }

    /**
     * @return RedirectResponse
     */
    public function store(StoreAdvanceAccountRequest $request, StoreAdvanceAccountAction $storeAdvanceAccountAction)
    {
        $data = $storeAdvanceAccountAction->execute($request->validated());

        return redirect()->back()->with([
            'success' => __('Customer advance added successfully.'),
            'redirect_url' => url('advanced-accounts-receipt/'.$data->id),
        ]);
    }

    /**
     * Display the specified customer.
     */
    public function show($id, Request $request, ShowAdvanceAccountAction $showAdvanceAccountAction): AdvanceAccountDetailResource|Response|ResponseFactory
    {
        $advancedAccount = $showAdvanceAccountAction->execute($id);
        if ($request->expectsJson()) {
            return new AdvanceAccountDetailResource($advancedAccount);
        }

        return inertia('AdvanceAccounts/AdvanceAccountDetail', ['data' => new AdvanceAccountDetailResource($advancedAccount)]);
    }

    /**
     * @return RedirectResponse
     */
    public function update(UpdateAdvanceAccountRequest $request, AdvancedAccount $advancedAccount, UpdateAdvanceAccountAction $updateAdvanceAccountAction)
    {
        $updateAdvanceAccountAction->execute($advancedAccount, $request->validated());

        return redirect()->back()->with('success', __('Customer advance updated successfully.'));
    }

    /**
     * @return RedirectResponse
     */
    public function destroy(AdvancedAccount $advancedAccount, DeleteAdvanceAccountAction $deleteAdvanceAccountAction)
    {
        $deleteAdvanceAccountAction->execute($advancedAccount);

        return redirect()->back()->with('success', __('Customer advance deleted successfully.'));
    }

    /**
     * @throws Exception
     * @throws \PhpOffice\PhpSpreadsheet\Writer\Exception
     */
    public function exportExcel(Request $request): BinaryFileResponse
    {
        return Excel::download(new CustomerAdvancePaymentExport($request->all()), 'customer_advance_payments.xlsx');
    }

    public function advanceAccountReceipt(int $id, ShowAdvanceAccountAction $showAdvanceAccountAction)
    {
        $advanceAccount = $showAdvanceAccountAction->execute($id);

        $pdf = \niklasravnsborg\LaravelPdf\Facades\Pdf::loadView('advance_account.receipt_pdf', compact('advanceAccount'), [], [
            'format' => 'A4',
            'defaultFont' => 'sans-serif',
            'isRemoteEnabled' => true,
        ]);

        return $pdf->stream(($advanceAccount->amount > 0 ? 'Receipt' : 'Payment').'_Voucher_Advance_Payment_'.$advanceAccount->voucher_number.'.pdf');
    }

    /**
     * @return mixed
     */
    public function exportPdf(Request $request, ListAdvanceAccountsAction $listAdvanceAccountsAction)
    {
        $accounts = AdvanceAccountResource::collection(
            $listAdvanceAccountsAction->all($request->all())
        );
        $summary = $listAdvanceAccountsAction->getAdvanceSummary($request->all());

        $pdf = Pdf::loadView('advance_account.customer_advance_payments_pdf',
            compact('accounts', 'summary')
        )
            ->setPaper('a4', 'portrait')
            ->setOptions(['isRemoteEnabled' => true]);

        return $pdf->stream('customer_advance_payments_'.date('Y-m-d').'.pdf');
    }
}
