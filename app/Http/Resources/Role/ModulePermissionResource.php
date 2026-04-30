<?php

namespace App\Http\Resources\Role;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ModulePermissionResource extends JsonResource
{
    protected array $activePermissions;

    public function __construct($resource, ?array $activePermissions = [])
    {
        parent::__construct($resource);
        $this->activePermissions = $activePermissions ?? [];
    }

    public function toArray(Request $request): array
    {
        $modulePermissions = $this->permissions->map(function ($permission) {
            $permission->is_checked = in_array($permission->id, $this->activePermissions);
            unset($permission->module_id);

            return $permission->toArray();
        });

        return [
            'module_id' => $this->id,
            'module_name' => $this->name,
            'is_checked' => (
                ! empty($modulePermissions) &&
                collect($modulePermissions)->where('is_checked', true)->count() === count($modulePermissions)
            ),
            'permissions' => $modulePermissions,
        ];
    }
}
