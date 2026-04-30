<?php

declare(strict_types=1);

namespace App\Actions\Color;

use App\Models\Color;

class DeleteColorAction
{
    public function execute(Color $color): bool
    {
        return $color->delete();
    }
}
