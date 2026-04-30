<?php

declare(strict_types=1);

namespace App\Filters;

use App\Contracts\QueryFilter;
use Illuminate\Database\Eloquent\Builder;

class ExactMatchFilter implements QueryFilter
{
    public function __construct(
        protected string $column,
        protected mixed $value
    ) {}

    public function handle(Builder $query, \Closure $next): Builder
    {
        if ($this->value === null || $this->value === '') {
            return $next($query);
        }

        $query->where($this->column, $this->value);

        return $next($query);
    }
}
