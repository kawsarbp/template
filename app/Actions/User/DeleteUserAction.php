<?php

declare(strict_types=1);

namespace App\Actions\User;

use App\Models\User;

class DeleteUserAction
{
    public function execute(User $user): bool
    {
        return $user->delete();
    }
}
