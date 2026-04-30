<?php

namespace Database\Factories;

use App\Enums\BooleanStatus;
use App\Models\Brand;
use App\Models\Color;
use App\Models\Condition;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->words(3, true),
            'slug' => $this->faker->unique()->slug,
            'sku' => strtoupper($this->faker->unique()->bothify('SKU-#####')),
            'description' => $this->faker->optional()->sentence,
            'brand_id' => Brand::inRandomOrder()->value('id'),
            'color_id' => Color::inRandomOrder()->value('id'),
            'model' => $this->faker->word,
            'storage_capacity' => $this->faker->randomElement(['64GB', '128GB', '256GB']),
            'ram' => $this->faker->randomElement(['4GB', '6GB', '8GB']),
            'condition_id' => Condition::inRandomOrder()->value('id'),
            'operating_system' => $this->faker->randomElement(['Android', 'iOS']),
            'photos' => ['https://placehold.co/640x480?text='.$this->faker->word()],
            'is_active' => BooleanStatus::YES->value,
        ];
    }
}
