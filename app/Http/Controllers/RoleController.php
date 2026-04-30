<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Role\DeleteRoleAction;
use App\Actions\Role\ListRoleAction;
use App\Actions\Role\StoreRoleAction;
use App\Actions\Role\UpdateRoleAction;
use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Http\Resources\Role\ModulePermissionResource;
use App\Http\Resources\Role\RoleDetailResource;
use App\Http\Resources\Role\RoleListResource;
use App\Models\Module;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\ResponseFactory;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * @return Response|ResponseFactory
     */
    public function index(Request $request, ListRoleAction $listRoleAction)
    {
        $data = $listRoleAction->execute(
            filters: $request->all(),
            perPage: (int) $request->input('limit', 15)
        );

        return inertia('Role/Roles', [
            'data' => RoleListResource::collection($data),
        ]);
    }

    /**
     * @return RedirectResponse
     */
    public function store(StoreRoleRequest $request, StoreRoleAction $storeRoleAction)
    {
        $storeRoleAction->execute($request->validated());

        return redirect()->back()->with('success', __('Role added successfully.'));
    }

    /**
     * @return RoleDetailResource
     */
    public function show(Role $role)
    {
        return new RoleDetailResource($role);
    }

    /**
     * @return RedirectResponse
     */
    public function update(UpdateRoleRequest $request, Role $role, UpdateRoleAction $updateRoleAction)
    {
        $updateRoleAction->execute($role, $request->validated());

        return redirect()->back()->with('success', __('Role updated successfully.'));
    }

    /**
     * @return RedirectResponse
     */
    public function destroy(Role $role, DeleteRoleAction $deleteRoleAction)
    {
        $deleteRoleAction->execute($role);

        return redirect()->back()->with('success', __('Role deleted successfully.'));
    }

    public function allPermissions()
    {
        $modules = Module::with(['permissions' => function ($q) {
            $q->select('id', 'name', 'module_id');
        }])->select([
            'id',
            'name',
        ])->get();

        return $modules->map(function ($module) {
            return new ModulePermissionResource($module);
        });
    }
}
