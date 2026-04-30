<?php

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Enums\SaleType;
use App\Models\Customer;
use App\Models\Sale;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sale>
 */
class SaleFactory extends Factory
{
    protected $model = Sale::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $totalAmount = $this->faker->randomFloat(2, 100, 50000);

        return [
            'customer_id' => Customer::factory(),
            'sale_type' => $this->faker->randomElement(array_column(SaleType::cases(), 'value')),
            'sale_date' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'total_units' => $this->faker->numberBetween(1, 20),
            'total_amount' => $totalAmount,
            'discount' => 0,
            'total_paid' => 0,
            'total_due' => $totalAmount,
            'payment_status' => PaymentStatus::UNPAID,
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}
