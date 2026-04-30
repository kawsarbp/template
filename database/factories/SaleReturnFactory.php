<?php

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Models\Customer;
use App\Models\SaleReturn;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SaleReturn>
 */
class SaleReturnFactory extends Factory
{
    protected $model = SaleReturn::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $totalAmount = $this->faker->randomFloat(2, 100, 50000);

        return [
            'customer_id' => Customer::factory(),
            'return_date' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'total_units' => $this->faker->numberBetween(1, 20),
            'total_amount' => $totalAmount,
            'discount' => 0,
            'total_refunded' => 0,
            'total_due' => $totalAmount,
            'payment_status' => PaymentStatus::UNPAID,
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}
