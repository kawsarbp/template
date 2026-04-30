<?php

namespace Database\Factories;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Stock;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SaleItem>
 */
class SaleItemFactory extends Factory
{
    protected $model = SaleItem::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sale_id' => Sale::factory(),
            'stock_id' => Stock::factory(),
            'sale_price' => $this->faker->randomFloat(2, 100, 3000),
            'source_type' => 'stock',
            'line_number' => 1,
            'stock_purchase_id' => null,
        ];
    }
}
