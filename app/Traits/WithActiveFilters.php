<?php

namespace App\Traits;

use App\Models\BankAccount;
use App\Models\Brand;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

trait WithActiveFilters
{
    public function getActiveFilters(array $filters, array $withAdditional = []): array
    {
        // filter handler methods
        $handlers = [
            'bank_account' => 'getBankAccount',
            'role' => 'getRole',
            'user' => 'getUser',
            'customer' => 'getCustomer',
            'supplier' => 'getSupplier',
            'product' => 'getProduct',
            'brand' => 'getBrand',
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

    public function getBankAccount(?int $id)
    {
        return BankAccount::select($this->getSelectionColumns('id', 'holder_name'))->find($id);
    }

    public function getUser(?int $id)
    {
        return User::select($this->getSelectionColumns())
            ->find($id);
    }

    public function getRole(?int $id)
    {
        return Role::select($this->getSelectionColumns())->find($id);
    }

    public function getCustomer(?int $id)
    {
        return Customer::select($this->getSelectionColumns())->find($id);
    }

    public function getSupplier(?int $id)
    {
        return Supplier::select($this->getSelectionColumns())->find($id);
    }

    public function getBrand(?int $id)
    {
        return Brand::select($this->getSelectionColumns())->find($id);
    }

    public function getProduct(?int $id)
    {
        return Product::query()
            ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
            ->select([
                DB::raw('products.id AS value'),
                DB::raw("CONCAT(COALESCE(brands.name, ''), ' ', products.model, ' - ', products.title) AS label"),
            ])->find($id);
    }

    private function getSelectionColumns($idColumn = 'id', $nameColumn = 'name'): array
    {
        return [
            DB::raw("{$idColumn} AS value"),
            DB::raw("{$nameColumn} AS label"),
        ];
    }
}
