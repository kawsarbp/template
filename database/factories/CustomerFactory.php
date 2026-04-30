<?php

namespace Database\Factories;

use App\Enums\VisibilityStatus;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->optional()->phoneNumber(),
            'company_name' => $this->faker->optional()->company(),
            'address' => $this->faker->optional()->address(),
            'country' => $this->faker->optional()->country(),
            'state' => $this->faker->optional()->state(),
            'city' => $this->faker->optional()->city(),
            'status' => $this->faker->randomElement([VisibilityStatus::ACTIVE->value, VisibilityStatus::INACTIVE->value]),
        ];
    }
}
