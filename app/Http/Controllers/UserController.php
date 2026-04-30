<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\User\DeleteUserAction;
use App\Actions\User\ListUserAction;
use App\Actions\User\StoreUserAction;
use App\Actions\User\UpdateUserAction;
use App\Exports\UsersExport;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\User\UserResource;
use App\Models\User;
use App\Traits\WithActiveFilters;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class UserController extends Controller
{
    use WithActiveFilters;

    public function index(Request $request, ListUserAction $listUserAction)
    {
        $data = $listUserAction->execute(
            filters: $request->all(),
            perPage: (int) $request->input('limit', 15)
        );

        return inertia('User/Users', [
            'data' => UserResource::collection($data)
                ->additional($this->getActiveFilters($request->all(), ['role'])),
        ]);
    }

    public function store(StoreUserRequest $request, StoreUserAction $storeUserAction)
    {
        $storeUserAction->execute($request->validated());

        return redirect()->back()->with('success', __('User added successfully.'));
    }

    public function show(User $user)
    {
        return new UserResource($user);
    }

    public function update(UpdateUserRequest $request, User $user, UpdateUserAction $updateUserAction)
    {
        $updateUserAction->execute($user, $request->validated());

        return redirect()->back()->with('success', __('User updated successfully.'));
    }

    public function destroy(User $user, DeleteUserAction $deleteUserAction)
    {
        $deleteUserAction->execute($user);

        return redirect()->back()->with('success', __('User deleted successfully.'));
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        return Excel::download(new UsersExport($request->all()), 'users.xlsx');
    }
}
