<?php

declare(strict_types=1);

namespace App\Filters;

use App\Contracts\QueryFilter;
use Illuminate\Database\Eloquent\Builder;

class RelationFilter implements QueryFilter
{
    public function __construct(
        protected string $relation,
        protected string $column,
        protected mixed $value,
        protected string $operator = '='
    ) {}

    public function handle(Builder $query, \Closure $next): Builder
    {
        if ($this->value === null || $this->value === '') {
            return $next($query);
        }

        $query->whereHas($this->relation, function (Builder $query) {
            if (is_array($this->value)) {
                $query->whereIn($this->column, $this->value);
            } else {
                $query->where($this->column, $this->operator, $this->value);
            }
        });

        return $next($query);
    }
}
