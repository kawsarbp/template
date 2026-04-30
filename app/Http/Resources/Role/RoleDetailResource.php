<?php

declare(strict_types=1);

namespace App\Http\Resources\Role;

use App\Models\Module;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class RoleDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'modules' => $this->getPermission($this->permissions->pluck('id')->toArray()),
        ];
    }

    private function getPermission(array $permissions): Collection|\Illuminate\Support\Collection
    {
        $modules = Module::with(['permissions' => function ($q) {
            $q->select('id', 'name', 'module_id');
        }])->select([
            'id',
            'name',
        ])->get();

        return $modules->map(function ($module) use ($permissions) {
            return new ModulePermissionResource($module, $permissions);
        });
    }
}
