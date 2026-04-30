<?php

declare(strict_types=1);

namespace App\Contracts;

use Illuminate\Database\Eloquent\Builder;

interface QueryFilter
{
    /**
     * Apply the filter to the query builder.
     */
    public function handle(Builder $query, \Closure $next): Builder;
}
