<?php

declare(strict_types=1);

namespace App\Actions\Brand;

use App\Models\Brand;

class DeleteBrandAction
{
    public function execute(Brand $brand): bool
    {
        return $brand->delete();
    }
}
