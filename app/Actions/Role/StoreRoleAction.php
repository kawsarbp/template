<?php

declare(strict_types=1);

namespace App\Actions\Role;

use App\Http\Resources\Role\RoleDetailResource;
use Spatie\Permission\Models\Role;

class StoreRoleAction
{
    public function execute(array $data): RoleDetailResource
    {
        $role = Role::create($data);
        $role->save();

        $role->syncPermissions($data['permissions']);

        return new RoleDetailResource($role);
    }
}
