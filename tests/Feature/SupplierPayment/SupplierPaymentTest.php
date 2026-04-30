<?php

declare(strict_types=1);

use App\Enums\PaymentStatus;
use App\Models\BankAccount;
use App\Models\StockPurchase;
use App\Models\StockPurchasePayment;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    $this->bankAccount = BankAccount::factory()->create();
    $this->supplier = Supplier::factory()->create();
});

it('renders the supplier payments index page', function (): void {
    $response = $this->get('/supplier-payments');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('SupplierPayment/Index'));
});

it('renders the create supplier payment page', function (): void {
    $response = $this->get('/supplier-payments/create');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('SupplierPayment/Create'));
});

it('can create an advance supplier payment without line items', function (): void {
    $response = $this->from('/supplier-payments/create')->post('/supplier-payments', [
        'supplier_id' => $this->supplier->id,
        'amount' => 500.00,
        'payment_date' => '2026-04-12',
        'bank_account_id' => $this->bankAccount->id,
        'paid_to' => 'John Doe',
        'notes' => 'Advance payment',
    ]);

    $response->assertRedirect('/supplier-payments')
        ->assertSessionHas('success', __('Supplier payment added successfully.'));

    $this->assertDatabaseHas('stock_purchase_payments', [
        'supplier_id' => $this->supplier->id,
        'amount' => 500.00,
        'bank_account_id' => $this->bankAccount->id,
        'paid_to' => 'John Doe',
        'is_bulk_payment' => true,
        'parent_id' => null,
        'stock_purchase_id' => null,
    ]);
});

it('can create a supplier payment with line items and updates stock purchase due amounts', function (): void {
    $purchase1 = StockPurchase::factory()->create([
        'supplier_id' => $this->supplier->id,
        'total_amount' => 1000,
        'discount' => 0,
        'total_paid' => 0,
        'total_due' => 1000,
        'payment_status' => PaymentStatus::UNPAID,
    ]);

    $purchase2 = StockPurchase::factory()->create([
        'supplier_id' => $this->supplier->id,
        'total_amount' => 2000,
        'discount' => 0,
        'total_paid' => 0,
        'total_due' => 2000,
        'payment_status' => PaymentStatus::UNPAID,
    ]);

    $response = $this->from('/supplier-payments/create')->post('/supplier-payments', [
        'supplier_id' => $this->supplier->id,
        'amount' => 1500.00,
        'payment_date' => '2026-04-12',
        'bank_account_id' => $this->bankAccount->id,
        'paid_to' => 'Supplier Co',
        'line_items' => [
            ['stock_purchase_id' => $purchase1->id, 'pay_now' => 500],
            ['stock_purchase_id' => $purchase2->id, 'pay_now' => 1000],
        ],
    ]);

    $response->assertRedirect('/supplier-payments')
        ->assertSessionHas('success', __('Supplier payment added successfully.'));

    $parent = StockPurchasePayment::query()
        ->where('is_bulk_payment', true)
        ->where('supplier_id', $this->supplier->id)
        ->whereNull('parent_id')
        ->first();

    expect($parent)->not->toBeNull()
        ->and($parent->amount)->toEqual(1500.00)
        ->and($parent->children()->count())->toEqual(2);

    $purchase1->refresh();
    $purchase2->refresh();

    expect($purchase1->total_paid)->toEqual(500)
        ->and($purchase1->payment_status)->toBe(PaymentStatus::PARTIAL)
        ->and($purchase2->total_paid)->toEqual(1000)
        ->and($purchase2->payment_status)->toBe(PaymentStatus::PARTIAL);
});

it('validates required fields', function (): void {
    $response = $this->post('/supplier-payments', []);

    $response->assertSessionHasErrors(['supplier_id', 'amount', 'payment_date', 'bank_account_id']);
});

it('validates amount must be positive', function (): void {
    $response = $this->post('/supplier-payments', [
        'supplier_id' => $this->supplier->id,
        'amount' => 0,
        'payment_date' => '2026-04-12',
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $response->assertSessionHasErrors(['amount']);
});

it('validates that line item pay_now must be positive', function (): void {
    $purchase = StockPurchase::factory()->create([
        'supplier_id' => $this->supplier->id,
        'total_amount' => 1000,
        'total_paid' => 0,
        'total_due' => 1000,
        'payment_status' => PaymentStatus::UNPAID,
    ]);

    $response = $this->post('/supplier-payments', [
        'supplier_id' => $this->supplier->id,
        'amount' => 500.00,
        'payment_date' => '2026-04-12',
        'bank_account_id' => $this->bankAccount->id,
        'line_items' => [
            ['stock_purchase_id' => $purchase->id, 'pay_now' => 0],
        ],
    ]);

    $response->assertSessionHasErrors(['line_items.0.pay_now']);
});

it('renders the edit page with existing payment data', function (): void {
    $purchase = StockPurchase::factory()->create([
        'supplier_id' => $this->supplier->id,
        'total_amount' => 1000,
        'total_paid' => 300,
        'total_due' => 700,
        'payment_status' => PaymentStatus::PARTIAL,
    ]);

    $parent = StockPurchasePayment::factory()->create([
        'is_bulk_payment' => true,
        'supplier_id' => $this->supplier->id,
        'stock_purchase_id' => null,
        'amount' => 500,
        'bank_account_id' => $this->bankAccount->id,
    ]);

    StockPurchasePayment::factory()->create([
        'is_bulk_payment' => false,
        'parent_id' => $parent->id,
        'supplier_id' => $this->supplier->id,
        'stock_purchase_id' => $purchase->id,
        'amount' => 300,
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $response = $this->get("/supplier-payments/{$parent->id}/edit");

    $response->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('SupplierPayment/Edit')
                ->has('payment.line_items', 1)
        );
});

it('can update a supplier payment header fields', function (): void {
    $parent = StockPurchasePayment::factory()->create([
        'is_bulk_payment' => true,
        'supplier_id' => $this->supplier->id,
        'stock_purchase_id' => null,
        'amount' => 500,
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $newBankAccount = BankAccount::factory()->create();

    $response = $this->put("/supplier-payments/{$parent->id}", [
        'amount' => 750,
        'payment_date' => '2026-04-15',
        'bank_account_id' => $newBankAccount->id,
        'paid_to' => 'Updated Name',
        'line_items' => [],
    ]);

    $response->assertRedirect('/supplier-payments')
        ->assertSessionHas('success', __('Supplier payment updated successfully.'));

    $parent->refresh();
    expect($parent->amount)->toEqual(750)
        ->and($parent->bank_account_id)->toEqual($newBankAccount->id)
        ->and($parent->paid_to)->toEqual('Updated Name');
});

it('can remove a line item on update and recalculates stock purchase', function (): void {
    $purchase = StockPurchase::factory()->create([
        'supplier_id' => $this->supplier->id,
        'total_amount' => 1000,
        'total_paid' => 300,
        'total_due' => 700,
        'payment_status' => PaymentStatus::PARTIAL,
    ]);

    $parent = StockPurchasePayment::factory()->create([
        'is_bulk_payment' => true,
        'supplier_id' => $this->supplier->id,
        'stock_purchase_id' => null,
        'amount' => 300,
        'bank_account_id' => $this->bankAccount->id,
    ]);

    StockPurchasePayment::factory()->create([
        'is_bulk_payment' => false,
        'parent_id' => $parent->id,
        'supplier_id' => $this->supplier->id,
        'stock_purchase_id' => $purchase->id,
        'amount' => 300,
        'bank_account_id' => $this->bankAccount->id,
    ]);

    // Update with empty line_items — removes the child
    $this->put("/supplier-payments/{$parent->id}", [
        'amount' => 300,
        'payment_date' => '2026-04-15',
        'bank_account_id' => $this->bankAccount->id,
        'line_items' => [],
    ]);

    $purchase->refresh();
    expect($purchase->total_paid)->toEqual(0)
        ->and($purchase->payment_status)->toBe(PaymentStatus::UNPAID);
});

it('can delete a supplier payment and restores stock purchase balances', function (): void {
    $purchase = StockPurchase::factory()->create([
        'supplier_id' => $this->supplier->id,
        'total_amount' => 1000,
        'total_paid' => 400,
        'total_due' => 600,
        'payment_status' => PaymentStatus::PARTIAL,
    ]);

    $parent = StockPurchasePayment::factory()->create([
        'is_bulk_payment' => true,
        'supplier_id' => $this->supplier->id,
        'stock_purchase_id' => null,
        'amount' => 400,
        'bank_account_id' => $this->bankAccount->id,
    ]);

    StockPurchasePayment::factory()->create([
        'is_bulk_payment' => false,
        'parent_id' => $parent->id,
        'supplier_id' => $this->supplier->id,
        'stock_purchase_id' => $purchase->id,
        'amount' => 400,
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $response = $this->delete("/supplier-payments/{$parent->id}");

    $response->assertRedirect('/supplier-payments')
        ->assertSessionHas('success', __('Supplier payment deleted successfully.'));

    $this->assertSoftDeleted('stock_purchase_payments', ['id' => $parent->id]);

    $purchase->refresh();
    expect($purchase->total_paid)->toEqual(0)
        ->and($purchase->payment_status)->toBe(PaymentStatus::UNPAID);
});

it('lists only bulk parent supplier payments on index', function (): void {
    $purchase = StockPurchase::factory()->create([
        'supplier_id' => $this->supplier->id,
        'total_amount' => 1000,
        'total_paid' => 0,
        'total_due' => 1000,
        'payment_status' => PaymentStatus::UNPAID,
    ]);

    $this->post('/supplier-payments', [
        'supplier_id' => $this->supplier->id,
        'amount' => 300.00,
        'payment_date' => '2026-04-12',
        'bank_account_id' => $this->bankAccount->id,
        'line_items' => [
            ['stock_purchase_id' => $purchase->id, 'pay_now' => 300],
        ],
    ]);

    $response = $this->get('/supplier-payments');

    $response->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('SupplierPayment/Index')
                ->has('data.data', 1)
        );
});
