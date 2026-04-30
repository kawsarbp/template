<?php

declare(strict_types=1);

namespace App\Actions\Product;

use App\Http\Resources\Product\ProductDetailResource;
use App\Models\Product;
use Illuminate\Support\Str;

class UpdateProductAction
{
    public function execute(Product $product, array $data): ProductDetailResource
    {
        $data['slug'] = Str::slug($data['title']);
        $product->update($data);

        return new ProductDetailResource($product);
    }
}
