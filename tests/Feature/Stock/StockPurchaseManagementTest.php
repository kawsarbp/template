<?php

declare(strict_types=1);

use App\Enums\ConditionEnum;
use App\Enums\PaymentStatus;
use App\Enums\StockStatus;
use App\Models\Product;
use App\Models\Stock;
use App\Models\StockPurchase;
use App\Models\StockPurchaseItem;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    $this->withoutVite();
});

it('can list all stock purchases', function (): void {
    StockPurchase::factory()->count(3)->create();

    $response = $this->get('/stock-purchases');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Stock/StockPurchases', false)
            ->has('data.data', 3)
        );
});

it('can filter stock purchases by search term', function (): void {
    $purchase1 = StockPurchase::factory()->create(['batch_number' => 'BATCH-20260215-0001']);
    $purchase2 = StockPurchase::factory()->create(['batch_number' => 'BATCH-20260215-0002']);

    $response = $this->get('/stock-purchases?search=0001');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Stock/StockPurchases', false)
            ->has('data.data', 1)
            ->where('data.data.0.batch_number', 'BATCH-20260215-0001')
        );
});

it('can filter stock purchases by payment status', function (): void {
    StockPurchase::factory()->create(['payment_status' => PaymentStatus::PAID]);
    StockPurchase::factory()->create(['payment_status' => PaymentStatus::UNPAID]);

    $response = $this->get('/stock-purchases?payment_status='.PaymentStatus::PAID->value);

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Stock/StockPurchases', false)
            ->has('data.data', 1)
            ->where('data.data.0.payment_status', PaymentStatus::PAID->value)
        );
});

it('can store a stock purchase with items and creates stock records', function (): void {
    $supplier = Supplier::factory()->create();
    $product = Product::factory()->create();

    $data = [
        'batch_number' => 'GLOT-TEST-001',
        'supplier_id' => $supplier->id,
        'purchase_date' => '2026-02-15',
        'discount' => 100,
        'notes' => 'Test purchase',
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 3,
                'unit_price' => 500.00,
                'condition' => ConditionEnum::EXCELLENT->value,
                'sale_price' => 700.00,
                'imeis' => ['123456789012345', '234567890123456', '345678901234567'],
            ],
        ],
    ];

    $response = $this->post('/stock-purchases', $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('Stock purchase created successfully.'));

    $this->assertDatabaseHas('stock_purchases', [
        'batch_number' => 'GLOT-TEST-001',
        'supplier_id' => $supplier->id,
        'total_units' => 3,
        'total_amount' => 1500.00,
        'discount' => 100.00,
        'total_due' => 1400.00,
        'total_paid' => 0,
        'payment_status' => PaymentStatus::UNPAID->value,
    ]);

    $this->assertDatabaseCount('stock_purchase_items', 1);
    $this->assertDatabaseCount('stocks', 3);

    $this->assertDatabaseHas('stocks', [
        'product_id' => $product->id,
        'imei' => '123456789012345',
        'status' => StockStatus::AVAILABLE->value,
        'purchase_price' => 500.00,
        'sale_price' => 700.00,
    ]);
});

it('validates supplier is required when creating a stock purchase', function (): void {
    $product = Product::factory()->create();

    $data = [
        'purchase_date' => '2026-02-15',
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 2,
                'unit_price' => 300.00,
                'condition' => ConditionEnum::GOOD->value,
                'imeis' => ['111111111111111', '222222222222222'],
            ],
        ],
    ];

    $response = $this->post('/stock-purchases', $data);

    $response->assertSessionHasErrors(['supplier_id']);
});

it('validates required fields when creating a stock purchase', function (): void {
    $response = $this->post('/stock-purchases', []);

    $response->assertSessionHasErrors(['batch_number', 'supplier_id', 'purchase_date', 'items']);
});

it('validates nested items fields', function (): void {
    $data = [
        'purchase_date' => '2026-02-15',
        'items' => [
            [
                'product_id' => '',
                'quantity' => 0,
                'unit_price' => -1,
                'condition' => '',
            ],
        ],
    ];

    $response = $this->post('/stock-purchases', $data);

    $response->assertSessionHasErrors([
        'items.0.product_id',
        'items.0.quantity',
        'items.0.unit_price',
        'items.0.condition',
        'items.0.imeis',
    ]);
});

it('validates IMEI count must match quantity', function (): void {
    $product = Product::factory()->create();

    $data = [
        'purchase_date' => '2026-02-15',
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 3,
                'unit_price' => 500.00,
                'condition' => ConditionEnum::EXCELLENT->value,
                'imeis' => ['111111111111111', '222222222222222'],
            ],
        ],
    ];

    $response = $this->post('/stock-purchases', $data);

    $response->assertSessionHasErrors(['items.0.imeis']);
});

it('validates IMEI uniqueness across existing stocks', function (): void {
    $product = Product::factory()->create();
    $item = StockPurchaseItem::factory()->create();
    Stock::factory()->create([
        'stock_purchase_item_id' => $item->id,
        'product_id' => $item->product_id,
        'imei' => '999999999999999',
    ]);

    $data = [
        'purchase_date' => '2026-02-15',
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 1,
                'unit_price' => 500.00,
                'condition' => ConditionEnum::EXCELLENT->value,
                'imeis' => ['999999999999999'],
            ],
        ],
    ];

    $response = $this->post('/stock-purchases', $data);

    $response->assertSessionHasErrors(['items.0.imeis.0']);
});

it('validates IMEI uniqueness within same request', function (): void {
    $product = Product::factory()->create();

    $data = [
        'purchase_date' => '2026-02-15',
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 2,
                'unit_price' => 500.00,
                'condition' => ConditionEnum::EXCELLENT->value,
                'imeis' => ['111111111111111', '111111111111111'],
            ],
        ],
    ];

    $response = $this->post('/stock-purchases', $data);

    $response->assertSessionHasErrors(['items.0.imeis.0']);
});

it('can show a specific stock purchase', function (): void {
    $purchase = StockPurchase::factory()->create();

    $response = $this->getJson("/stock-purchases/{$purchase->id}");

    $response->assertSuccessful()
        ->assertJsonPath('data.id', $purchase->id)
        ->assertJsonPath('data.batch_number', $purchase->batch_number);
});

it('can update a stock purchase header', function (): void {
    $purchase = StockPurchase::factory()->create(['discount' => 0, 'total_amount' => 1000, 'total_due' => 1000]);

    $data = [
        'batch_number' => $purchase->batch_number,
        'supplier_id' => $purchase->supplier_id,
        'purchase_date' => '2026-02-10',
        'discount' => 50,
        'notes' => 'Updated notes',
    ];

    $response = $this->put("/stock-purchases/{$purchase->id}", $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('Stock purchase updated successfully.'));

    $this->assertDatabaseHas('stock_purchases', [
        'id' => $purchase->id,
        'notes' => 'Updated notes',
        'discount' => 50,
    ]);

    $fresh = $purchase->fresh();
    expect($fresh->purchase_date->format('Y-m-d'))->toBe('2026-02-10');
    expect((float) $fresh->total_due)->toBe(950.0);
});

it('can delete a stock purchase and soft deletes stocks', function (): void {
    $purchase = StockPurchase::factory()->create();
    $item = StockPurchaseItem::factory()->create([
        'stock_purchase_id' => $purchase->id,
    ]);
    $stock = Stock::factory()->create([
        'stock_purchase_item_id' => $item->id,
        'product_id' => $item->product_id,
    ]);

    $response = $this->delete("/stock-purchases/{$purchase->id}");

    $response->assertRedirect()
        ->assertSessionHas('success', __('Stock purchase deleted successfully.'));

    $this->assertSoftDeleted('stock_purchases', ['id' => $purchase->id]);
    $this->assertSoftDeleted('stocks', ['id' => $stock->id]);
});

it('cannot delete a stock purchase with sold items', function (): void {
    $purchase = StockPurchase::factory()->create();
    $item = StockPurchaseItem::factory()->create([
        'stock_purchase_id' => $purchase->id,
    ]);
    Stock::factory()->create([
        'stock_purchase_item_id' => $item->id,
        'product_id' => $item->product_id,
        'status' => StockStatus::SOLD,
    ]);

    $response = $this->delete("/stock-purchases/{$purchase->id}");

    $response->assertRedirect()
        ->assertSessionHas('error');

    $this->assertDatabaseHas('stock_purchases', ['id' => $purchase->id, 'deleted_at' => null]);
});

it('uses user-provided batch number on creation', function (): void {
    $supplier = Supplier::factory()->create();
    $product = Product::factory()->create();

    $data = [
        'batch_number' => 'GLOT-CUSTOM-001',
        'supplier_id' => $supplier->id,
        'purchase_date' => '2026-02-15',
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 1,
                'unit_price' => 100.00,
                'condition' => ConditionEnum::GOOD->value,
                'imeis' => ['888888888888888'],
            ],
        ],
    ];

    $this->post('/stock-purchases', $data);

    $purchase = StockPurchase::first();
    expect($purchase->batch_number)->toBe('GLOT-CUSTOM-001');
});

it('can paginate stock purchases', function (): void {
    StockPurchase::factory()->count(20)->create();

    $response = $this->get('/stock-purchases?limit=5');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Stock/StockPurchases', false)
            ->has('data.data', 5)
            ->where('data.meta.per_page', 5)
        );
});

it('returns 404 when showing non-existent stock purchase', function (): void {
    $response = $this->get('/stock-purchases/999');

    $response->assertNotFound();
});
