<?php

namespace Database\Factories;

use App\Enums\VisibilityStatus;
use App\Models\Condition;
use Illuminate\Database\Eloquent\Factories\Factory;

class ConditionFactory extends Factory
{
    protected $model = Condition::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word(),
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
