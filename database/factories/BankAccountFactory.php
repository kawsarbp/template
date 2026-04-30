<?php

namespace Database\Factories;

use App\Enums\VisibilityStatus;
use App\Models\BankAccount;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BankAccount>
 */
class BankAccountFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->optional()->company(),
            'holder_name' => $this->faker->name(),
            'account_number' => $this->faker->unique()->numerify('############'),
            'opening_balance' => $this->faker->randomFloat(2, 0, 500000),
            'created_by' => User::factory(),
            'status' => VisibilityStatus::ACTIVE->value,
        ];
    }
}
