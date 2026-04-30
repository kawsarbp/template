<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pipeline\Pipeline;

abstract class BaseFilterService
{
    /**
     * The model class to query.
     *
     * @var class-string<Model>
     */
    protected string $model;

    /**
     * Get filtered results with pagination.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getFiltered(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->applyDefaultSorting($this->buildQuery($filters), $filters)->paginate($perPage);
    }

    /**
     * Get all filtered results without pagination.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getAllFiltered(array $filters): Collection
    {
        return $this->applyDefaultSorting($this->buildQuery($filters), $filters)->get();
    }

    /**
     * Get the first filtered result.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getFirstFiltered(array $filters): ?Model
    {
        return $this->applyDefaultSorting($this->buildQuery($filters), $filters)->first();
    }

    /**
     * Get the query builder with filters applied.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getQuery(array $filters): Builder
    {
        return $this->applyDefaultSorting($this->buildQuery($filters), $filters);
    }

    /**
     * Build the query with filters applied.
     *
     * @param  array<string, mixed>  $filters
     */
    protected function buildQuery(array $filters): Builder
    {
        $query = $this->model::query();

        $pipes = $this->buildFilterPipeline($filters);

        return app(Pipeline::class)
            ->send($query)
            ->through($pipes)
            ->thenReturn();
    }

    /**
     * Apply default sorting if no sort direction is specified.
     *
     * @param  array<string, mixed>  $filters
     */
    protected function applyDefaultSorting(Builder $query, array $filters): Builder
    {
        if (! isset($filters['sort_direction'])) {
            $query->orderBy($query->getModel()->getTable().'.'.$query->getModel()->getKeyName(), 'desc');
        }

        return $query;
    }

    /**
     * Build the filter pipeline based on provided filters.
     *
     * @param  array<string, mixed>  $filters
     * @return array<int, object>
     */
    protected function buildFilterPipeline(array $filters): array
    {
        $pipes = [];
        $config = $this->filterConfig();

        foreach ($config as $filterKey => $definition) {
            $filter = $this->resolveFilter($filterKey, $definition, $filters);

            if ($filter !== null) {
                $pipes[] = $filter;
            }
        }

        return $pipes;
    }

    /**
     * Resolve a filter instance from configuration.
     *
     * @param  array<string, mixed>|callable  $definition
     * @param  array<string, mixed>  $filters
     */
    protected function resolveFilter(string|int $filterKey, array|callable $definition, array $filters): ?object
    {
        // Handle callable definitions for custom logic
        if (is_callable($definition)) {
            return $definition($filters);
        }

        // Extract configuration
        $filterClass = $definition['filter'];
        $requiredKeys = (array) ($definition['keys'] ?? [$filterKey]);
        $params = $definition['params'] ?? [];

        // Check if any required filter keys are present
        $hasRequiredValues = false;
        foreach ($requiredKeys as $key) {
            if (array_key_exists($key, $filters) && $filters[$key] !== '' && $filters[$key] !== null) {
                $hasRequiredValues = true;
                break;
            }
        }

        if (! $hasRequiredValues) {
            return null;
        }

        // Build parameters by resolving values from filters
        $resolvedParams = [];
        foreach ($params as $paramKey => $paramValue) {
            $resolvedParams[$paramKey] = $this->resolveParam($paramValue, $filters);
        }

        return new $filterClass(...$resolvedParams);
    }

    /**
     * Resolve parameter value from filters.
     */
    protected function resolveParam(mixed $value, array $filters): mixed
    {
        // If value is a callable, execute it with filters
        if (is_callable($value)) {
            return $value($filters);
        }

        // If value starts with '$', it's a reference to a filter key
        if (is_string($value) && str_starts_with($value, '$')) {
            $key = substr($value, 1);

            return $filters[$key] ?? null;
        }

        // Otherwise, return the literal value
        return $value;
    }

    /**
     * Define the filter configuration.
     * Override this in child classes to define filters declaratively.
     *
     * @return array<string|int, array<string, mixed>|callable>
     */
    abstract protected function filterConfig(): array;
}
