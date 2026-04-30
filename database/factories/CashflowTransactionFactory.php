<?php

namespace Database\Factories;

use App\Models\BankAccount;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CashflowTransactionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'type' => $this->faker->randomElement([1, 2]),
            'name' => $this->faker->words(2, true),
            'bank_account_id' => $this->faker->randomElement([BankAccount::CASH, BankAccount::NON_CASH_ID]),
            'date' => $this->faker->date(),
            'amount' => $this->faker->numberBetween(100, 100000),
            'description' => $this->faker->optional()->sentence(),
            'attachment' => [],
            'created_by' => User::factory(),
        ];
    }
}
