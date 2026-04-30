<?php

declare(strict_types=1);

namespace App\Actions\User;

use App\Services\UserService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

readonly class ListUserAction
{
    public function __construct(
        private UserService $userService,
    ) {}

    public function execute(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->userService->getFiltered($filters, $perPage);
    }
}
