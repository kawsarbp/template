<?php

declare(strict_types=1);

namespace App\Filters;

use App\Contracts\QueryFilter;
use Illuminate\Database\Eloquent\Builder;

class SearchFilter implements QueryFilter
{
    /**
     * @param  array<int, string>  $columns
     */
    public function __construct(
        protected string $searchTerm,
        protected array $columns = []
    ) {}

    public function handle(Builder $query, \Closure $next): Builder
    {
        if (empty($this->searchTerm) || empty($this->columns)) {
            return $next($query);
        }

        $query->where(function (Builder $query) {
            foreach ($this->columns as $column) {
                // Check if column contains dot notation (relationship)
                if (str_contains($column, '.')) {
                    $this->applyRelationSearch($query, $column);
                } else {
                    $query->orWhere($column, 'LIKE', "%{$this->searchTerm}%");
                }
            }
        });

        return $next($query);
    }

    /**
     * Apply search on a relationship column.
     */
    protected function applyRelationSearch(Builder $query, string $column): void
    {
        // Split relation.column into parts (supports nested relations like 'customer.address.city')
        $parts = explode('.', $column);
        $columnName = array_pop($parts);
        $relation = implode('.', $parts);

        $query->orWhereHas($relation, function (Builder $query) use ($columnName) {
            $query->where($columnName, 'LIKE', "%{$this->searchTerm}%");
        });
    }
}
