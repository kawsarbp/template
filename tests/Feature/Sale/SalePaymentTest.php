<?php

declare(strict_types=1);

use App\Enums\PaymentStatus;
use App\Models\BankAccount;
use App\Models\Sale;
use App\Models\SalePayment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    $this->bankAccount = BankAccount::factory()->create();
});

it('can add a payment to a sale', function (): void {
    $sale = Sale::factory()->create([
        'total_amount' => 1000,
        'discount' => 0,
        'total_paid' => 0,
        'total_due' => 1000,
        'payment_status' => PaymentStatus::UNPAID,
    ]);

    $response = $this->post("/sales/{$sale->id}/payments", [
        'amount' => 400,
        'payment_date' => '2026-02-16',
        'bank_account_id' => $this->bankAccount->id,
        'notes' => 'First payment',
    ]);

    $response->assertRedirect()
        ->assertSessionHas('success', __('Payment added successfully.'));

    $sale->refresh();
    expect($sale->total_paid)->toEqual(400)
        ->and($sale->total_due)->toEqual(600)
        ->and($sale->payment_status)->toBe(PaymentStatus::PARTIAL);

    $this->assertDatabaseHas('sale_payments', [
        'sale_id' => $sale->id,
        'amount' => 400,
        'bank_account_id' => $this->bankAccount->id,
    ]);
});

it('updates payment status to paid when fully paid', function (): void {
    $sale = Sale::factory()->create([
        'total_amount' => 500,
        'discount' => 0,
        'total_paid' => 0,
        'total_due' => 500,
        'payment_status' => PaymentStatus::UNPAID,
    ]);

    $this->post("/sales/{$sale->id}/payments", [
        'amount' => 500,
        'payment_date' => '2026-02-16',
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $sale->refresh();
    expect($sale->total_paid)->toEqual(500)
        ->and($sale->total_due)->toEqual(0)
        ->and($sale->payment_status)->toBe(PaymentStatus::PAID);
});

it('cannot overpay a sale', function (): void {
    $sale = Sale::factory()->create([
        'total_amount' => 500,
        'discount' => 0,
        'total_paid' => 0,
        'total_due' => 500,
        'payment_status' => PaymentStatus::UNPAID,
    ]);

    $response = $this->post("/sales/{$sale->id}/payments", [
        'amount' => 600,
        'payment_date' => '2026-02-16',
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $response->assertSessionHasErrors(['amount']);
});

it('can delete a payment and recalculates totals', function (): void {
    $sale = Sale::factory()->create([
        'total_amount' => 1000,
        'discount' => 0,
        'total_paid' => 400,
        'total_due' => 600,
        'payment_status' => PaymentStatus::PARTIAL,
    ]);

    $payment = SalePayment::factory()->create([
        'sale_id' => $sale->id,
        'amount' => 400,
    ]);

    $response = $this->delete("/sale-payments/{$payment->id}");

    $response->assertRedirect()
        ->assertSessionHas('success', __('Payment deleted successfully.'));

    $sale->refresh();
    expect($sale->total_paid)->toEqual(0)
        ->and($sale->total_due)->toEqual(1000)
        ->and($sale->payment_status)->toBe(PaymentStatus::UNPAID);
});

it('handles discount in total_due calculation', function (): void {
    $sale = Sale::factory()->create([
        'total_amount' => 1000,
        'discount' => 200,
        'total_paid' => 0,
        'total_due' => 800,
        'payment_status' => PaymentStatus::UNPAID,
    ]);

    $this->post("/sales/{$sale->id}/payments", [
        'amount' => 800,
        'payment_date' => '2026-02-16',
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $sale->refresh();
    expect($sale->total_paid)->toEqual(800)
        ->and($sale->total_due)->toEqual(0)
        ->and($sale->payment_status)->toBe(PaymentStatus::PAID);
});

it('transitions from unpaid to partial to paid', function (): void {
    $sale = Sale::factory()->create([
        'total_amount' => 1000,
        'discount' => 0,
        'total_paid' => 0,
        'total_due' => 1000,
        'payment_status' => PaymentStatus::UNPAID,
    ]);

    expect($sale->payment_status)->toBe(PaymentStatus::UNPAID);

    $this->post("/sales/{$sale->id}/payments", [
        'amount' => 300,
        'payment_date' => '2026-02-16',
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $sale->refresh();
    expect($sale->payment_status)->toBe(PaymentStatus::PARTIAL);

    $this->post("/sales/{$sale->id}/payments", [
        'amount' => 700,
        'payment_date' => '2026-02-16',
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $sale->refresh();
    expect($sale->payment_status)->toBe(PaymentStatus::PAID);
});

it('validates payment amount is required', function (): void {
    $sale = Sale::factory()->create();

    $response = $this->post("/sales/{$sale->id}/payments", [
        'payment_date' => '2026-02-16',
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $response->assertSessionHasErrors(['amount']);
});

it('validates payment date is required', function (): void {
    $sale = Sale::factory()->create();

    $response = $this->post("/sales/{$sale->id}/payments", [
        'amount' => 100,
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $response->assertSessionHasErrors(['payment_date']);
});

it('validates bank account is required', function (): void {
    $sale = Sale::factory()->create();

    $response = $this->post("/sales/{$sale->id}/payments", [
        'amount' => 100,
        'payment_date' => '2026-02-16',
    ]);

    $response->assertSessionHasErrors(['bank_account_id']);
});
