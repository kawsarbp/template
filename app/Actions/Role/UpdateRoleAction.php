<?php

declare(strict_types=1);

namespace App\Actions\Role;

use App\Http\Resources\Role\RoleDetailResource;
use Spatie\Permission\Models\Role;

class UpdateRoleAction
{
    public function execute(Role $role, array $data): RoleDetailResource
    {
        $role->update($data);

        $role->syncPermissions($data['permissions']);

        return new RoleDetailResource($role);
    }
}
