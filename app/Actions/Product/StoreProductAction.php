<?php

declare(strict_types=1);

namespace App\Actions\Product;

use App\Http\Resources\Product\ProductDetailResource;
use App\Models\Product;
use Illuminate\Support\Str;

class StoreProductAction
{
    public function execute(array $data): ProductDetailResource
    {
        $data['slug'] = Str::slug($data['title']);
        $product = Product::create($data);

        return new ProductDetailResource($product);
    }
}
