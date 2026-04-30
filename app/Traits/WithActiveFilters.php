<?php

namespace App\Traits;

use App\Models\User;
use Illuminate\Support\Facades\DB;

trait WithActiveFilters
{
    public function getActiveFilters(array $filters, array $withAdditional = []): array
    {
        // filter handler methods
        $handlers = [
            'user' => 'getUser',
        ];

        // Apply filters based on the handlers map
        foreach ($withAdditional as $item) {
            if (isset($handlers[$item])) {
                $method = $handlers[$item];

                // check if the method exists, otherwise throw an exception
                if (! method_exists($this, $method)) {
                    throw new \BadMethodCallException("The method '{$method}' does not exist on ".__CLASS__);
                }

                $filters[$item] = $this->$method($filters[$item.'_id'] ?? null);
            }
        }

        return ['filters' => $filters];
    }

    public function getUser(?int $id)
    {
        return User::select($this->getSelectionColumns())
            ->find($id);
    }

    private function getSelectionColumns($idColumn = 'id', $nameColumn = 'name'): array
    {
        return [
            DB::raw("{$idColumn} AS value"),
            DB::raw("{$nameColumn} AS label"),
        ];
    }
}
