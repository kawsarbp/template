<?php

declare(strict_types=1);

use App\Enums\PaymentStatus;
use App\Enums\StockStatus;
use App\Models\BankAccount;
use App\Models\Customer;
use App\Models\SaleReturn;
use App\Models\SaleReturnPayment;
use App\Models\Stock;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();

    foreach (['manage sale return', 'create sale return', 'update sale return', 'view sale return', 'delete sale return'] as $perm) {
        $this->user->givePermissionTo(Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']));
    }

    $this->actingAs($this->user);
    $this->withoutVite();
});

it('can list sale returns', function (): void {
    SaleReturn::factory()->count(3)->create();

    $response = $this->get('/sale-returns');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('SaleReturn/SaleReturns', false)
            ->has('data.data', 3)
        );
});

it('can view the create sale return page', function (): void {
    $response = $this->get('/sale-returns/create');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('SaleReturn/CreateSaleReturn', false)
        );
});

it('can create a sale return and stock becomes available', function (): void {
    $stock = Stock::factory()->create(['status' => StockStatus::SOLD]);
    $customer = Customer::factory()->create();

    $payload = [
        'customer_id' => $customer->id,
        'return_date' => '2026-03-22',
        'notes' => 'Test return',
        'items' => [
            [
                'stock_id' => $stock->id,
                'return_price' => 500.00,
                'source_type' => 'stock',
                'line_number' => 1,
            ],
        ],
    ];

    $response = $this->post('/sale-returns', $payload);

    $response->assertRedirect();

    expect(SaleReturn::count())->toBe(1);

    $saleReturn = SaleReturn::first();
    expect($saleReturn->total_units)->toBe(1);
    expect($saleReturn->total_amount)->toBe(500.0);
    expect($saleReturn->payment_status)->toBe(PaymentStatus::UNPAID);
    expect($saleReturn->return_number)->toStartWith('RETURN-');

    $stock->refresh();
    expect($stock->status)->toBe(StockStatus::AVAILABLE);
});

it('creates initial payment when payment amount provided', function (): void {
    $stock = Stock::factory()->create(['status' => StockStatus::SOLD]);
    $bankAccount = BankAccount::factory()->create();

    $payload = [
        'return_date' => '2026-03-22',
        'payment' => 300.00,
        'items' => [
            [
                'stock_id' => $stock->id,
                'return_price' => 500.00,
                'source_type' => 'stock',
                'line_number' => 1,
            ],
        ],
    ];

    $this->post('/sale-returns', $payload);

    $saleReturn = SaleReturn::first();
    expect($saleReturn->payments()->count())->toBe(1);
    expect($saleReturn->total_refunded)->toBe(300.0);
    expect($saleReturn->payment_status)->toBe(PaymentStatus::PARTIAL);
});

it('rejects return of non-sold stock', function (): void {
    $stock = Stock::factory()->create(['status' => StockStatus::AVAILABLE]);

    $payload = [
        'return_date' => '2026-03-22',
        'items' => [
            [
                'stock_id' => $stock->id,
                'return_price' => 500.00,
                'source_type' => 'stock',
                'line_number' => 1,
            ],
        ],
    ];

    $response = $this->post('/sale-returns', $payload);

    $response->assertRedirect();
    expect(SaleReturn::count())->toBe(0);
});

it('can view sale return detail page', function (): void {
    $saleReturn = SaleReturn::factory()->create();

    $response = $this->get("/sale-returns/{$saleReturn->id}");

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('SaleReturn/SaleReturnDetail', false)
            ->has('data.data')
            ->where('data.data.return_number', $saleReturn->return_number)
        );
});

it('can add a refund payment to a sale return', function (): void {
    $saleReturn = SaleReturn::factory()->create([
        'total_amount' => 1000,
        'total_due' => 1000,
        'payment_status' => PaymentStatus::UNPAID,
    ]);
    $bankAccount = BankAccount::factory()->create();

    $payload = [
        'amount' => 500.00,
        'payment_date' => '2026-03-22',
        'bank_account_id' => $bankAccount->id,
        'notes' => 'Partial refund',
    ];

    $response = $this->post("/sale-returns/{$saleReturn->id}/payments", $payload);

    $response->assertRedirect();

    $saleReturn->refresh();
    expect($saleReturn->payments()->count())->toBe(1);
    expect($saleReturn->total_refunded)->toBe(500.0);
    expect($saleReturn->payment_status)->toBe(PaymentStatus::PARTIAL);
});

it('can delete a refund payment', function (): void {
    $saleReturn = SaleReturn::factory()->create([
        'total_amount' => 1000,
        'total_due' => 0,
        'total_refunded' => 1000,
        'payment_status' => PaymentStatus::PAID,
    ]);
    $payment = SaleReturnPayment::factory()->create([
        'sale_return_id' => $saleReturn->id,
        'amount' => 1000,
    ]);

    $response = $this->delete("/sale-return-payments/{$payment->id}");

    $response->assertRedirect();

    expect(SaleReturnPayment::count())->toBe(0);
    $saleReturn->refresh();
    expect($saleReturn->payment_status)->toBe(PaymentStatus::UNPAID);
});

it('cannot delete a sale return that has payments', function (): void {
    $saleReturn = SaleReturn::factory()->create();
    SaleReturnPayment::factory()->create(['sale_return_id' => $saleReturn->id]);

    $response = $this->delete("/sale-returns/{$saleReturn->id}");

    $response->assertRedirect();
    expect(SaleReturn::count())->toBe(1);
});

it('can delete a sale return with no payments and reverts stock to sold', function (): void {
    $stock = Stock::factory()->create(['status' => StockStatus::AVAILABLE]);
    $saleReturn = SaleReturn::factory()->create();
    $saleReturn->items()->create([
        'stock_id' => $stock->id,
        'return_price' => 500,
        'source_type' => 'stock',
        'line_number' => 1,
    ]);

    $response = $this->delete("/sale-returns/{$saleReturn->id}");

    $response->assertRedirect();
    expect(SaleReturn::count())->toBe(0);

    $stock->refresh();
    expect($stock->status)->toBe(StockStatus::SOLD);
});
