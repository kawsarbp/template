<?php

namespace Database\Factories;

use App\Models\Condition;
use App\Models\Product;
use App\Models\StockPurchase;
use App\Models\StockPurchaseItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockPurchaseItem>
 */
class StockPurchaseItemFactory extends Factory
{
    protected $model = StockPurchaseItem::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'stock_purchase_id' => StockPurchase::factory(),
            'product_id' => Product::factory(),
            'quantity' => $this->faker->numberBetween(1, 10),
            'unit_price' => $this->faker->randomFloat(2, 50, 2000),
            'condition_id' => Condition::inRandomOrder()->value('id'),
        ];
    }
}
