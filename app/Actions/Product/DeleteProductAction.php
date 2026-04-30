<?php

declare(strict_types=1);

namespace App\Actions\Product;

use App\Models\Product;

class DeleteProductAction
{
    public function execute(Product $product): bool
    {
        return $product->delete();
    }
}
