<?php

namespace Database\Factories;

use App\Models\BankAccount;
use App\Models\SaleReturn;
use App\Models\SaleReturnPayment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SaleReturnPayment>
 */
class SaleReturnPaymentFactory extends Factory
{
    protected $model = SaleReturnPayment::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sale_return_id' => SaleReturn::factory(),
            'amount' => $this->faker->randomFloat(2, 50, 5000),
            'payment_date' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'bank_account_id' => $this->faker->randomElement([BankAccount::CASH, BankAccount::NON_CASH_ID]),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}
