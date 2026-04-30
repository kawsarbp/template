<?php

declare(strict_types=1);

namespace App\Actions\Supplier;

use App\Http\Resources\Supplier\SupplierDetailResource;
use App\Models\Supplier;

class UpdateSupplierAction
{
    public function execute(Supplier $supplier, array $data): SupplierDetailResource
    {
        $supplier->update($data);

        return new SupplierDetailResource($supplier);
    }
}
