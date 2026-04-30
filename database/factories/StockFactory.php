<?php

namespace Database\Factories;

use App\Enums\StockStatus;
use App\Models\Condition;
use App\Models\Product;
use App\Models\Stock;
use App\Models\StockPurchaseItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Stock>
 */
class StockFactory extends Factory
{
    protected $model = Stock::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'stock_purchase_item_id' => StockPurchaseItem::factory(),
            'product_id' => Product::factory(),
            'imei' => $this->faker->numerify('###############'),
            'condition_id' => Condition::inRandomOrder()->value('id'),
            'purchase_price' => $this->faker->randomFloat(2, 50, 2000),
            'sale_price' => $this->faker->optional(0.8)->randomFloat(2, 100, 3000),
            'status' => StockStatus::AVAILABLE->value,
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}
