<?php

declare(strict_types=1);

namespace App\Actions\Color;

use App\Http\Resources\Color\ColorDetailResource;
use App\Models\Color;

class StoreColorAction
{
    public function execute(array $data): ColorDetailResource
    {
        $color = Color::create($data);

        return new ColorDetailResource($color);
    }
}
