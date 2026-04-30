<?php

declare(strict_types=1);

use App\Enums\PaymentStatus;
use App\Models\BankAccount;
use App\Models\StockPurchase;
use App\Models\StockPurchasePayment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    $this->bankAccount = BankAccount::factory()->create();
});

it('can add a payment to a stock purchase', function (): void {
    $purchase = StockPurchase::factory()->create([
        'total_amount' => 1000,
        'discount' => 0,
        'total_paid' => 0,
        'total_due' => 1000,
        'payment_status' => PaymentStatus::UNPAID,
    ]);

    $response = $this->post("/stock-purchases/{$purchase->id}/payments", [
        'amount' => 400,
        'payment_date' => '2026-02-16',
        'bank_account_id' => $this->bankAccount->id,
        'notes' => 'First payment',
    ]);

    $response->assertRedirect()
        ->assertSessionHas('success', __('Payment added successfully.'));

    $purchase->refresh();
    expect($purchase->total_paid)->toEqual(400)
        ->and($purchase->total_due)->toEqual(600)
        ->and($purchase->payment_status)->toBe(PaymentStatus::PARTIAL);

    $this->assertDatabaseHas('stock_purchase_payments', [
        'stock_purchase_id' => $purchase->id,
        'amount' => 400,
        'bank_account_id' => $this->bankAccount->id,
    ]);
});

it('updates payment status to paid when fully paid', function (): void {
    $purchase = StockPurchase::factory()->create([
        'total_amount' => 500,
        'discount' => 0,
        'total_paid' => 0,
        'total_due' => 500,
        'payment_status' => PaymentStatus::UNPAID,
    ]);

    $this->post("/stock-purchases/{$purchase->id}/payments", [
        'amount' => 500,
        'payment_date' => '2026-02-16',
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $purchase->refresh();
    expect($purchase->total_paid)->toEqual(500)
        ->and($purchase->total_due)->toEqual(0)
        ->and($purchase->payment_status)->toBe(PaymentStatus::PAID);
});

it('cannot overpay a stock purchase', function (): void {
    $purchase = StockPurchase::factory()->create([
        'total_amount' => 500,
        'discount' => 0,
        'total_paid' => 0,
        'total_due' => 500,
        'payment_status' => PaymentStatus::UNPAID,
    ]);

    $response = $this->post("/stock-purchases/{$purchase->id}/payments", [
        'amount' => 600,
        'payment_date' => '2026-02-16',
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $response->assertSessionHasErrors(['amount']);
});

it('can delete a payment and recalculates totals', function (): void {
    $purchase = StockPurchase::factory()->create([
        'total_amount' => 1000,
        'discount' => 0,
        'total_paid' => 400,
        'total_due' => 600,
        'payment_status' => PaymentStatus::PARTIAL,
    ]);

    $payment = StockPurchasePayment::factory()->create([
        'stock_purchase_id' => $purchase->id,
        'amount' => 400,
    ]);

    $response = $this->delete("/stock-purchase-payments/{$payment->id}");

    $response->assertRedirect()
        ->assertSessionHas('success', __('Payment deleted successfully.'));

    $purchase->refresh();
    expect($purchase->total_paid)->toEqual(0)
        ->and($purchase->total_due)->toEqual(1000)
        ->and($purchase->payment_status)->toBe(PaymentStatus::UNPAID);
});

it('handles discount in total_due calculation', function (): void {
    $purchase = StockPurchase::factory()->create([
        'total_amount' => 1000,
        'discount' => 200,
        'total_paid' => 0,
        'total_due' => 800,
        'payment_status' => PaymentStatus::UNPAID,
    ]);

    $this->post("/stock-purchases/{$purchase->id}/payments", [
        'amount' => 800,
        'payment_date' => '2026-02-16',
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $purchase->refresh();
    expect($purchase->total_paid)->toEqual(800)
        ->and($purchase->total_due)->toEqual(0)
        ->and($purchase->payment_status)->toBe(PaymentStatus::PAID);
});

it('can add bulk payment to multiple purchases', function (): void {
    $purchase1 = StockPurchase::factory()->create([
        'total_amount' => 1000,
        'discount' => 0,
        'total_paid' => 0,
        'total_due' => 1000,
        'payment_status' => PaymentStatus::UNPAID,
    ]);

    $purchase2 = StockPurchase::factory()->create([
        'total_amount' => 2000,
        'discount' => 0,
        'total_paid' => 0,
        'total_due' => 2000,
        'payment_status' => PaymentStatus::UNPAID,
    ]);

    $response = $this->post('/stock-purchases/bulk-payment', [
        'stock_purchase_ids' => [$purchase1->id, $purchase2->id],
        'amount' => 500,
        'payment_date' => '2026-02-16',
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $response->assertRedirect()
        ->assertSessionHas('success', __('Bulk payment added successfully.'));

    $purchase1->refresh();
    $purchase2->refresh();

    expect($purchase1->total_paid)->toEqual(500)
        ->and($purchase1->payment_status)->toBe(PaymentStatus::PARTIAL)
        ->and($purchase2->total_paid)->toEqual(500)
        ->and($purchase2->payment_status)->toBe(PaymentStatus::PARTIAL);
});

it('transitions from unpaid to partial to paid', function (): void {
    $purchase = StockPurchase::factory()->create([
        'total_amount' => 1000,
        'discount' => 0,
        'total_paid' => 0,
        'total_due' => 1000,
        'payment_status' => PaymentStatus::UNPAID,
    ]);

    expect($purchase->payment_status)->toBe(PaymentStatus::UNPAID);

    $this->post("/stock-purchases/{$purchase->id}/payments", [
        'amount' => 300,
        'payment_date' => '2026-02-16',
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $purchase->refresh();
    expect($purchase->payment_status)->toBe(PaymentStatus::PARTIAL);

    $this->post("/stock-purchases/{$purchase->id}/payments", [
        'amount' => 700,
        'payment_date' => '2026-02-16',
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $purchase->refresh();
    expect($purchase->payment_status)->toBe(PaymentStatus::PAID);
});

it('validates payment amount is required', function (): void {
    $purchase = StockPurchase::factory()->create();

    $response = $this->post("/stock-purchases/{$purchase->id}/payments", [
        'payment_date' => '2026-02-16',
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $response->assertSessionHasErrors(['amount']);
});

it('validates payment date is required', function (): void {
    $purchase = StockPurchase::factory()->create();

    $response = $this->post("/stock-purchases/{$purchase->id}/payments", [
        'amount' => 100,
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $response->assertSessionHasErrors(['payment_date']);
});

it('validates bank account is required', function (): void {
    $purchase = StockPurchase::factory()->create();

    $response = $this->post("/stock-purchases/{$purchase->id}/payments", [
        'amount' => 100,
        'payment_date' => '2026-02-16',
    ]);

    $response->assertSessionHasErrors(['bank_account_id']);
});

it('can update a payment and recalculates totals', function (): void {
    $purchase = StockPurchase::factory()->create([
        'total_amount' => 1000,
        'discount' => 0,
        'total_paid' => 400,
        'total_due' => 600,
        'payment_status' => PaymentStatus::PARTIAL,
    ]);

    $payment = StockPurchasePayment::factory()->create([
        'stock_purchase_id' => $purchase->id,
        'amount' => 400,
        'payment_date' => '2026-02-16',
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $newBankAccount = BankAccount::factory()->create();

    $response = $this->put("/stock-purchase-payments/{$payment->id}", [
        'amount' => 600,
        'payment_date' => '2026-03-01',
        'bank_account_id' => $newBankAccount->id,
        'notes' => 'Updated payment',
    ]);

    $response->assertRedirect()
        ->assertSessionHas('success', __('Payment updated successfully.'));

    $purchase->refresh();
    expect($purchase->total_paid)->toEqual(600)
        ->and($purchase->total_due)->toEqual(400)
        ->and($purchase->payment_status)->toBe(PaymentStatus::PARTIAL);

    $this->assertDatabaseHas('stock_purchase_payments', [
        'id' => $payment->id,
        'amount' => 600,
        'bank_account_id' => $newBankAccount->id,
        'notes' => 'Updated payment',
    ]);
});

it('validates update payment fields are required', function (): void {
    $purchase = StockPurchase::factory()->create();
    $payment = StockPurchasePayment::factory()->create([
        'stock_purchase_id' => $purchase->id,
    ]);

    $response = $this->put("/stock-purchase-payments/{$payment->id}", []);

    $response->assertSessionHasErrors(['amount', 'payment_date', 'bank_account_id']);
});
