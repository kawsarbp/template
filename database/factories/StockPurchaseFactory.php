<?php

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Models\StockPurchase;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockPurchase>
 */
class StockPurchaseFactory extends Factory
{
    protected $model = StockPurchase::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $totalAmount = $this->faker->randomFloat(2, 100, 50000);

        return [
            'supplier_id' => Supplier::factory(),
            'total_units' => $this->faker->numberBetween(1, 50),
            'total_amount' => $totalAmount,
            'discount' => 0,
            'total_paid' => 0,
            'total_due' => $totalAmount,
            'payment_status' => PaymentStatus::UNPAID,
            'purchase_date' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}
