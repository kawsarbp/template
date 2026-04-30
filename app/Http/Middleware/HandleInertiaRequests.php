<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Http\Resources\User\UserResource;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Spatie\Permission\Models\Permission;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = auth()->user();
        $permissions = ! empty($user) ? $user->getAllPermissions()->pluck('id', 'name')->toArray() : [];
        if ($user && $user->hasRole('owner')) {
            $permissions = Permission::pluck('id', 'name')->toArray();
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'user' => $user ? new UserResource($user) : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'permissions' => empty($permissions) ? new \stdClass : $permissions,
            'media_url' => config('app.media_url'),
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'data' => fn () => $request->session()->get('data'),
                'redirect_url' => fn () => $request->session()->get('redirect_url'),
            ],
            'old' => fn () => $request->session()->get('_old_input', []),
        ];
    }
}
