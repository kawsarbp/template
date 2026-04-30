<?php

declare(strict_types=1);

namespace App\Actions\Brand;

use App\Http\Resources\Brand\BrandDetailResource;
use App\Models\Brand;

class StoreBrandAction
{
    public function execute(array $data): BrandDetailResource
    {
        $brand = Brand::create($data);

        return new BrandDetailResource($brand);
    }
}
