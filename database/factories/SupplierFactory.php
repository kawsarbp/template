<?php

namespace Database\Factories;

use App\Enums\Currency;
use App\Enums\VisibilityStatus;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Supplier>
 */
class SupplierFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'supplier_id' => $this->faker->unique()->numberBetween(100000, 999999),
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->optional()->phoneNumber(),
            'company_name' => $this->faker->optional()->company(),
            'address' => $this->faker->optional()->address(),
            'currency' => Currency::AED->value,
            'status' => VisibilityStatus::ACTIVE->value,
        ];
    }
}
