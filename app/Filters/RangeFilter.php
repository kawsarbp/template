<?php

declare(strict_types=1);

namespace App\Filters;

use App\Contracts\QueryFilter;
use Illuminate\Database\Eloquent\Builder;

class RangeFilter implements QueryFilter
{
    public function __construct(
        protected string $column,
        protected ?float $min = null,
        protected ?float $max = null
    ) {}

    public function handle(Builder $query, \Closure $next): Builder
    {
        if ($this->min !== null) {
            $query->where($this->column, '>=', $this->min);
        }

        if ($this->max !== null) {
            $query->where($this->column, '<=', $this->max);
        }

        return $next($query);
    }
}
