<?php

namespace Database\Seeders;

use App\Enums\StockStatus;
use App\Models\CashflowTransaction;
use App\Models\Condition;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Stock;
use App\Models\StockPurchase;
use App\Models\StockPurchaseItem;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $owner = User::updateOrCreate(
            ['email' => 'dev@ignitionit.com'],
            [
                'name' => 'Ignition Developer',
                'email' => 'dev@ignitionit.com',
                'password' => Hash::make('password'),
            ]
        );

        $this->call([
            ModuleSeeder::class,
            PermissionSeeder::class,
            RoleSeeder::class,
            BrandSeeder::class,
            ColorSeeder::class,
            BankAccountSeeder::class,
        ]);
        $owner->assignRole('owner');

        Customer::factory(50)->create();
        CashflowTransaction::factory(30)->create();
        Product::factory(60)->create();
        Supplier::factory(20)->create();
        Sale::factory(100)->create();

        // Seed stock purchases with items and stock units
        $products = Product::all();
        $suppliers = Supplier::all();

        $conditions = Condition::all();

        StockPurchase::factory(100)->create([
            'supplier_id' => fn () => $suppliers->random()->id,
        ])->each(function ($purchase) use ($products, $conditions) {
            $itemCount = rand(1, 4);
            $totalUnits = 0;
            $totalAmount = 0;

            for ($i = 0; $i < $itemCount; $i++) {
                $product = $products->random();
                $quantity = rand(1, 5);
                $unitPrice = rand(100, 2000);
                $conditionId = $conditions->random()->id;

                $item = StockPurchaseItem::factory()->create([
                    'stock_purchase_id' => $purchase->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'condition_id' => $conditionId,
                ]);

                for ($j = 0; $j < $quantity; $j++) {
                    Stock::factory()->create([
                        'stock_purchase_item_id' => $item->id,
                        'product_id' => $product->id,
                        'condition_id' => $conditionId,
                        'purchase_price' => $unitPrice,
                        'sale_price' => $unitPrice * 1.3,
                        'status' => StockStatus::AVAILABLE->value,
                    ]);
                }

                $totalUnits += $quantity;
                $totalAmount += $quantity * $unitPrice;
            }

            $purchase->update([
                'total_units' => $totalUnits,
                'total_amount' => $totalAmount,
                'total_due' => $totalAmount,
            ]);
        });
    }
}
