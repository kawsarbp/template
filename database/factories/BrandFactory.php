<?php

namespace Database\Factories;

use App\Enums\VisibilityStatus;
use App\Models\Brand;
use Illuminate\Database\Eloquent\Factories\Factory;

class BrandFactory extends Factory
{
    protected $model = Brand::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->company(),
            'status' => VisibilityStatus::ACTIVE->value,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VisibilityStatus::INACTIVE->value,
        ]);
    }
}
