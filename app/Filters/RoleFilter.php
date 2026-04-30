<?php

declare(strict_types=1);

namespace App\Filters;

use App\Contracts\QueryFilter;
use Closure;
use Illuminate\Database\Eloquent\Builder;

class RoleFilter implements QueryFilter
{
    public function handle(Builder $query, Closure $next): Builder
    {
        $query->whereHas('roles', function ($q) {
            $q->where('id', request('role'));
        });

        return $next($query);
    }
}
