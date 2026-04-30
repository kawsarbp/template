<?php

declare(strict_types=1);

namespace App\Filters;

use App\Contracts\QueryFilter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class DateRangeFilter implements QueryFilter
{
    public function __construct(
        protected string $column,
        protected ?string $date = null,
    ) {}

    public function handle(Builder $query, \Closure $next): Builder
    {
        if (Str::contains($this->date ?? '', ' to ')) {
            $range = dateRangeToDateTimeRange(explode(' to ', $this->date));
            if (is_array($range) && count($range) === 2) {
                $query->whereBetween($this->column, $range);
            }
        } elseif (! empty($this->date)) {
            $query->whereDate($this->column, $this->date);
        }

        return $next($query);
    }
}
