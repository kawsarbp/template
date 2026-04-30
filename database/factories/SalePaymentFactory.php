<?php

namespace Database\Factories;

use App\Models\BankAccount;
use App\Models\Sale;
use App\Models\SalePayment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SalePayment>
 */
class SalePaymentFactory extends Factory
{
    protected $model = SalePayment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sale_id' => Sale::factory(),
            'amount' => $this->faker->randomFloat(2, 50, 5000),
            'payment_date' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'bank_account_id' => $this->faker->randomElement([BankAccount::CASH, BankAccount::NON_CASH_ID]),
            'notes' => $this->faker->optional()->sentence(),
            'voucher_number' => $this->faker->numberBetween(100000, 999999),
        ];
    }
}
