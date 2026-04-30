<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Customer\DeleteCustomerAction;
use App\Actions\Customer\ListCustomersAction;
use App\Actions\Customer\StoreCustomerAction;
use App\Actions\Customer\UpdateCustomerAction;
use App\Exports\CustomersExport;
use App\Http\Requests\Customer\StoreCustomerRequest;
use App\Http\Requests\Customer\UpdateCustomerRequest;
use App\Http\Resources\Customer\CustomerDetailResource;
use App\Http\Resources\Customer\CustomerListResource;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\ResponseFactory;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers with filtering.
     */
    public function index(Request $request, ListCustomersAction $listCustomersAction)
    {
        $filters = $request->all();

        $customers = $listCustomersAction->execute(
            filters: $filters,
            perPage: (int) $request->input('limit', 15)
        );

        return inertia('Customer/Customers', [
            'data' => CustomerListResource::collection($customers),
        ]);
    }

    /**
     * Store a newly created customer.
     */
    public function store(StoreCustomerRequest $request, StoreCustomerAction $storeCustomerAction)
    {
        $storeCustomerAction->execute($request->validated());

        return redirect()->back()->with('success', __('Customer added successfully.'));
    }

    /**
     * Display the specified customer.
     */
    public function show(Customer $customer, Request $request): CustomerDetailResource|Response|ResponseFactory
    {
        $customer->load(['activity_log']);

        if ($request->expectsJson()) {
            return new CustomerDetailResource($customer);
        }

        return inertia('Customer/CustomerDetail', ['data' => new CustomerDetailResource($customer)]);
    }

    /**
     * Update the specified customer.
     */
    public function update(UpdateCustomerRequest $request, Customer $customer, UpdateCustomerAction $updateCustomerAction)
    {
        $updateCustomerAction->execute($customer, $request->validated());

        return redirect()->back()->with('success', __('Customer updated successfully.'));
    }

    /**
     * Remove the specified customer.
     */
    public function destroy(Customer $customer, DeleteCustomerAction $deleteCustomerAction)
    {
        $deleteCustomerAction->execute($customer);

        return redirect()->back()->with('success', __('Customer deleted successfully.'));
    }

    /**
     * Export customers to Excel.
     */
    public function exportExcel(Request $request): BinaryFileResponse
    {
        return Excel::download(new CustomersExport($request->all()), 'customers.xlsx');
    }
}
