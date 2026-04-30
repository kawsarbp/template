<?php

declare(strict_types=1);

namespace App\Filters;

use App\Contracts\QueryFilter;
use Illuminate\Database\Eloquent\Builder;

class InFilter implements QueryFilter
{
    /**
     * @param  array<int, mixed>  $values
     */
    public function __construct(
        protected string $column,
        protected array $values = []
    ) {}

    public function handle(Builder $query, \Closure $next): Builder
    {
        if (empty($this->values)) {
            return $next($query);
        }

        $query->whereIn($this->column, $this->values);

        return $next($query);
    }
}
