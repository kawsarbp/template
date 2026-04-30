<?php

declare(strict_types=1);

namespace App\Actions\Brand;

use App\Http\Resources\Brand\BrandDetailResource;
use App\Models\Brand;

class UpdateBrandAction
{
    public function execute(Brand $brand, array $data): BrandDetailResource
    {
        $brand->update($data);

        return new BrandDetailResource($brand);
    }
}
