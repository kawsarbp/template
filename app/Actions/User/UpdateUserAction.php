<?php

declare(strict_types=1);

namespace App\Actions\User;

use App\Http\Resources\User\UserResource;
use App\Models\User;

class UpdateUserAction
{
    public function execute(User $user, array $data): UserResource
    {
        $user->update($data);
        $user->assignRole($user->role?->name);

        return new UserResource($user);
    }
}
