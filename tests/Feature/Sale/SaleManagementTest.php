<?php

declare(strict_types=1);

use App\Enums\PaymentStatus;
use App\Enums\SaleType;
use App\Enums\StockStatus;
use App\Models\Customer;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SalePayment;
use App\Models\Stock;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    $this->withoutVite();
});

it('can list all sales', function (): void {
    Sale::factory()->count(3)->create();

    $response = $this->get('/sales');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Sale/Sales', false)
            ->has('data.data', 3)
        );
});

it('can paginate sales', function (): void {
    Sale::factory()->count(20)->create();

    $response = $this->get('/sales?limit=5');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Sale/Sales', false)
            ->has('data.data', 5)
            ->where('data.meta.per_page', 5)
        );
});

it('can filter sales by search term', function (): void {
    Sale::factory()->create(['sale_number' => 'SALE-20260216-0001']);
    Sale::factory()->create(['sale_number' => 'SALE-20260216-0002']);

    $response = $this->get('/sales?search=0001');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Sale/Sales', false)
            ->has('data.data', 1)
            ->where('data.data.0.sale_number', 'SALE-20260216-0001')
        );
});

it('can filter sales by payment status', function (): void {
    Sale::factory()->create(['payment_status' => PaymentStatus::PAID]);
    Sale::factory()->create(['payment_status' => PaymentStatus::UNPAID]);

    $response = $this->get('/sales?payment_status='.PaymentStatus::PAID->value);

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Sale/Sales', false)
            ->has('data.data', 1)
            ->where('data.data.0.payment_status', PaymentStatus::PAID->value)
        );
});

it('can filter sales by sale type', function (): void {
    Sale::factory()->create(['sale_type' => SaleType::Bulk]);
    Sale::factory()->create(['sale_type' => SaleType::Retail]);

    $response = $this->get('/sales?sale_type='.SaleType::Bulk->value);

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Sale/Sales', false)
            ->has('data.data', 1)
            ->where('data.data.0.sale_type', SaleType::Bulk->value)
        );
});

it('can create a sale with stock items', function (): void {
    $customer = Customer::factory()->create();
    $stock1 = Stock::factory()->create(['status' => StockStatus::AVAILABLE]);
    $stock2 = Stock::factory()->create(['status' => StockStatus::AVAILABLE]);

    $data = [
        'customer_id' => $customer->id,
        'sale_type' => SaleType::Retail->value,
        'sale_date' => '2026-02-16',
        'discount' => 50,
        'notes' => 'Test sale',
        'items' => [
            ['stock_id' => $stock1->id, 'sale_price' => 500.00],
            ['stock_id' => $stock2->id, 'sale_price' => 700.00],
        ],
    ];

    $response = $this->post('/sales', $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('Sale created successfully.'));

    $this->assertDatabaseHas('sales', [
        'customer_id' => $customer->id,
        'sale_type' => SaleType::Retail->value,
        'total_units' => 2,
        'total_amount' => 1200.00,
        'discount' => 50.00,
        'total_due' => 1150.00,
        'total_paid' => 0,
        'payment_status' => PaymentStatus::UNPAID->value,
    ]);

    $this->assertDatabaseCount('sale_items', 2);

    // Stocks should now be SOLD
    expect($stock1->fresh()->status)->toBe(StockStatus::SOLD);
    expect($stock2->fresh()->status)->toBe(StockStatus::SOLD);
});

it('auto-generates sale number on creation', function (): void {
    $stock = Stock::factory()->create(['status' => StockStatus::AVAILABLE]);

    $this->post('/sales', [
        'sale_type' => SaleType::Retail->value,
        'sale_date' => '2026-02-16',
        'items' => [
            ['stock_id' => $stock->id, 'sale_price' => 100.00],
        ],
    ]);

    $sale = Sale::first();
    expect($sale->sale_number)->toStartWith('SALE-');
});

it('can show a specific sale', function (): void {
    $sale = Sale::factory()->create();

    $response = $this->getJson("/sales/{$sale->id}");

    $response->assertSuccessful()
        ->assertJsonPath('data.id', $sale->id)
        ->assertJsonPath('data.sale_number', $sale->sale_number);
});

it('can update a sale header', function (): void {
    $sale = Sale::factory()->create([
        'discount' => 0,
        'total_amount' => 1000,
        'total_due' => 1000,
    ]);

    $data = [
        'customer_id' => $sale->customer_id,
        'sale_type' => SaleType::Bulk->value,
        'sale_date' => '2026-02-10',
        'discount' => 100,
        'notes' => 'Updated notes',
    ];

    $response = $this->put("/sales/{$sale->id}", $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('Sale updated successfully.'));

    $this->assertDatabaseHas('sales', [
        'id' => $sale->id,
        'notes' => 'Updated notes',
        'discount' => 100,
    ]);

    $fresh = $sale->fresh();
    expect($fresh->sale_date->format('Y-m-d'))->toBe('2026-02-10');
    expect((float) $fresh->total_due)->toBe(900.0);
});

it('can delete a sale and reverts stock status', function (): void {
    $sale = Sale::factory()->create();
    $stock = Stock::factory()->create(['status' => StockStatus::SOLD]);

    SaleItem::create([
        'sale_id' => $sale->id,
        'stock_id' => $stock->id,
        'sale_price' => 500,
    ]);

    $response = $this->delete("/sales/{$sale->id}");

    $response->assertRedirect()
        ->assertSessionHas('success', __('Sale deleted successfully.'));

    $this->assertSoftDeleted('sales', ['id' => $sale->id]);
    expect($stock->fresh()->status)->toBe(StockStatus::AVAILABLE);
});

it('cannot delete a sale with payments', function (): void {
    $sale = Sale::factory()->create();
    SalePayment::factory()->create(['sale_id' => $sale->id]);

    $response = $this->delete("/sales/{$sale->id}");

    $response->assertRedirect()
        ->assertSessionHas('error');

    $this->assertDatabaseHas('sales', ['id' => $sale->id, 'deleted_at' => null]);
});

it('validates required fields when creating a sale', function (): void {
    $response = $this->post('/sales', []);

    $response->assertSessionHasErrors(['sale_type', 'sale_date', 'items']);
});

it('validates stock must exist', function (): void {
    $data = [
        'sale_type' => SaleType::Retail->value,
        'sale_date' => '2026-02-16',
        'items' => [
            ['stock_id' => 99999, 'sale_price' => 100],
        ],
    ];

    $response = $this->post('/sales', $data);

    $response->assertSessionHasErrors(['items.0.stock_id']);
});

it('validates stock must be available', function (): void {
    $stock = Stock::factory()->create(['status' => StockStatus::SOLD]);

    $data = [
        'sale_type' => SaleType::Retail->value,
        'sale_date' => '2026-02-16',
        'items' => [
            ['stock_id' => $stock->id, 'sale_price' => 100],
        ],
    ];

    $response = $this->post('/sales', $data);

    $response->assertSessionHasErrors(['items.0.stock_id']);
});

it('validates no duplicate stock ids in request', function (): void {
    $stock = Stock::factory()->create(['status' => StockStatus::AVAILABLE]);

    $data = [
        'sale_type' => SaleType::Retail->value,
        'sale_date' => '2026-02-16',
        'items' => [
            ['stock_id' => $stock->id, 'sale_price' => 100],
            ['stock_id' => $stock->id, 'sale_price' => 200],
        ],
    ];

    $response = $this->post('/sales', $data);

    $response->assertSessionHasErrors(['items']);
});

it('returns 404 when showing non-existent sale', function (): void {
    $response = $this->get('/sales/999');

    $response->assertNotFound();
});
