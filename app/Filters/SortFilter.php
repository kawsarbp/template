<?php

declare(strict_types=1);

namespace App\Filters;

use App\Contracts\QueryFilter;
use Illuminate\Database\Eloquent\Builder;

class SortFilter implements QueryFilter
{
    public function __construct(
        protected string $column,
        protected string $direction = 'asc'
    ) {}

    public function handle(Builder $query, \Closure $next): Builder
    {
        $direction = strtolower($this->direction);

        if (! in_array($direction, ['asc', 'desc'])) {
            $direction = 'desc';
        }

        $query->orderBy($this->column, $direction);

        return $next($query);
    }
}
