<?php

declare(strict_types=1);

namespace App\Actions\Role;

use App\Services\RoleService;

class ListRoleAction
{
    public function __construct(
        private RoleService $roleService,
    ) {}

    public function execute(array $filters, int $perPage = 15)
    {
        return $this->roleService->getFiltered($filters, $perPage);
    }
}
