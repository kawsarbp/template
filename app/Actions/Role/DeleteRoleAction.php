<?php

declare(strict_types=1);

namespace App\Actions\Role;

use Spatie\Permission\Models\Role;

class DeleteRoleAction
{
    public function execute(Role $role): bool
    {
        return $role->delete();
    }
}
