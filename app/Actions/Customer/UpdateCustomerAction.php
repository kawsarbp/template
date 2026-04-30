<?php

declare(strict_types=1);

namespace App\Actions\Customer;

use App\Http\Resources\Customer\CustomerDetailResource;
use App\Models\Customer;

class UpdateCustomerAction
{
    public function execute(Customer $customer, array $data): CustomerDetailResource
    {
        $customer->update($data);

        return new CustomerDetailResource($customer);
    }
}
