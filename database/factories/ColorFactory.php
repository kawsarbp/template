<?php

namespace Database\Factories;

use App\Enums\VisibilityStatus;
use App\Models\Color;
use Illuminate\Database\Eloquent\Factories\Factory;

class ColorFactory extends Factory
{
    protected $model = Color::class;

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
