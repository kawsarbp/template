<?php

declare(strict_types=1);

namespace App\Actions\Color;

use App\Http\Resources\Color\ColorDetailResource;
use App\Models\Color;

class UpdateColorAction
{
    public function execute(Color $color, array $data): ColorDetailResource
    {
        $color->update($data);

        return new ColorDetailResource($color);
    }
}
