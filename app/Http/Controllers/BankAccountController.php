<?php

namespace App\Http\Controllers;

use App\Actions\BankAccount\DeleteBankAccountAction;
use App\Actions\BankAccount\ListBankAccountAction;
use App\Actions\BankAccount\StoreBankAccountAction;
use App\Actions\BankAccount\UpdateBankAccountAction;
use App\Http\Requests\BankAccount\StoreBankAccountRequest;
use App\Http\Requests\BankAccount\UpdateBankAccountRequest;
use App\Http\Resources\BankAccount\BankAccountDetailResource;
use App\Http\Resources\BankAccount\BankAccountListResource;
use App\Models\BankAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\ResponseFactory;

class BankAccountController extends Controller
{
    /**
     * @return Response|ResponseFactory
     */
    public function index(Request $request, ListBankAccountAction $listBankAccountAction)
    {
        $data = $listBankAccountAction->execute(
            filters: $request->all(),
            perPage: (int) $request->input('limit', 15)
        );

        return inertia('BankAccount/BankAccounts', [
            'data' => BankAccountListResource::collection($data),
        ]);
    }

    /**
     * @return RedirectResponse
     */
    public function store(StoreBankAccountRequest $request, StoreBankAccountAction $storeBankAccountAction)
    {
        $storeBankAccountAction->execute($request->validated());

        return redirect()->back()->with('success', __('BankAccount added successfully.'));
    }

    /**
     * @return BankAccountDetailResource
     */
    public function show(BankAccount $bankAccount)
    {
        return new BankAccountDetailResource($bankAccount);
    }

    /**
     * @return RedirectResponse
     */
    public function update(UpdateBankAccountRequest $request, BankAccount $bankAccount, UpdateBankAccountAction $updateBankAccountAction)
    {
        $updateBankAccountAction->execute($bankAccount, $request->validated());

        return redirect()->back()->with('success', __('BankAccount updated successfully.'));
    }

    /**
     * @return RedirectResponse
     */
    public function destroy(BankAccount $bankAccount, DeleteBankAccountAction $deleteBankAccountAction)
    {
        if (in_array($bankAccount->id, [BankAccount::CASH, BankAccount::NON_CASH_ID])) {
            return redirect()->back()->with('error', __('BankAccount cannot be deleted.'));
        }
        $deleteBankAccountAction->execute($bankAccount);

        return redirect()->back()->with('success', __('BankAccount deleted successfully.'));
    }
}
