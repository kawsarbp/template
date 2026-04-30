<?php

declare(strict_types=1);

namespace App\Actions\Customer;

use App\Models\Customer;

class DeleteCustomerAction
{
    public function execute(Customer $customer): bool
    {
        return $customer->delete();
    }
}
