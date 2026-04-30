<?php

declare(strict_types=1);

namespace App\Actions\Supplier;

use App\Http\Resources\Supplier\SupplierDetailResource;
use App\Models\Supplier;

class StoreSupplierAction
{
    public function execute(array $data): SupplierDetailResource
    {
        $supplier = Supplier::create($data);

        return new SupplierDetailResource($supplier);
    }
}
