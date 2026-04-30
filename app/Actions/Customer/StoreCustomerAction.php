<?php

declare(strict_types=1);

namespace App\Actions\Customer;

use App\Http\Resources\Customer\CustomerDetailResource;
use App\Models\Customer;

class StoreCustomerAction
{
    public function execute(array $data): CustomerDetailResource
    {
        $customer = Customer::create($data);

        return new CustomerDetailResource($customer);
    }
}
