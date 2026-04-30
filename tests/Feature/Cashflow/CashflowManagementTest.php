<?php

declare(strict_types=1);

use App\Enums\CashflowType;
use App\Models\BankAccount;
use App\Models\CashflowTransaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    $this->withoutVite();
    $this->bankAccount = BankAccount::factory()->create();
});

it('can list all cashflow transactions', function (): void {
    CashflowTransaction::factory()->count(3)->create(['bank_account_id' => $this->bankAccount->id]);

    $response = $this->get('/cashflow-transactions');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('CashFlow/CashFlows', false)
            ->has('data.data', 3)
        );
});

it('can paginate cashflow transactions', function (): void {
    CashflowTransaction::factory()->count(20)->create(['bank_account_id' => $this->bankAccount->id]);

    $response = $this->get('/cashflow-transactions?limit=5');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('CashFlow/CashFlows', false)
            ->has('data.data', 5)
            ->where('data.meta.per_page', 5)
        );
});

it('can filter by search term', function (): void {
    CashflowTransaction::factory()->create([
        'name' => 'Office Supplies',
        'bank_account_id' => $this->bankAccount->id,
    ]);
    CashflowTransaction::factory()->create([
        'name' => 'Salary Payment',
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $response = $this->get('/cashflow-transactions?search=Office Supplies');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('CashFlow/CashFlows', false)
            ->has('data.data', 1)
            ->where('data.data.0.name', 'Office Supplies')
        );
});

it('can filter by type', function (): void {
    CashflowTransaction::factory()->create([
        'type' => CashflowType::CASH_IN->value,
        'bank_account_id' => $this->bankAccount->id,
    ]);
    CashflowTransaction::factory()->create([
        'type' => CashflowType::CASH_OUT->value,
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $response = $this->get('/cashflow-transactions?type=1');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('CashFlow/CashFlows', false)
            ->has('data.data', 1)
        );
});

it('can filter by bank account', function (): void {
    $otherBankAccount = BankAccount::factory()->create();

    CashflowTransaction::factory()->create(['bank_account_id' => $this->bankAccount->id]);
    CashflowTransaction::factory()->create(['bank_account_id' => $otherBankAccount->id]);

    $response = $this->get("/cashflow-transactions?bank_account_id={$this->bankAccount->id}");

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('CashFlow/CashFlows', false)
            ->has('data.data', 1)
        );
});

it('can show a specific cashflow transaction as json', function (): void {
    $cashflow = CashflowTransaction::factory()->create([
        'name' => 'Test Transaction',
        'bank_account_id' => $this->bankAccount->id,
        'type' => CashflowType::CASH_IN->value,
        'amount' => 5000,
    ]);

    $response = $this->getJson("/cashflow-transactions/{$cashflow->id}");

    $response->assertSuccessful()
        ->assertJsonPath('data.name', 'Test Transaction')
        ->assertJsonPath('data.amount', 5000)
        ->assertJsonStructure([
            'data' => [
                'name',
                'date',
                'voucher_number',
                'description',
                'bank_account_id',
                'bank_account_name',
                'type',
                'type_name',
                'amount',
                'attachment',
                'receipt_pdf',
            ],
        ]);
});

it('returns 404 for non-existent cashflow transaction', function (): void {
    $response = $this->get('/cashflow-transactions/9999');

    $response->assertNotFound();
});

it('can create a cashflow transaction', function (): void {
    $data = [
        'name' => 'New Transaction',
        'date' => '2025-01-15',
        'type' => CashflowType::CASH_IN->value,
        'amount' => 1500,
        'bank_account_id' => $this->bankAccount->id,
        'description' => 'Test description',
    ];

    $response = $this->post('/cashflow-transactions', $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('CashFlow added successfully.'));

    $this->assertDatabaseHas('cashflow_transactions', [
        'name' => 'New Transaction',
        'amount' => 1500,
        'bank_account_id' => $this->bankAccount->id,
    ]);
});

it('auto-generates voucher number on creation', function (): void {
    $data = [
        'name' => 'Voucher Test',
        'date' => '2025-01-15',
        'type' => CashflowType::CASH_IN->value,
        'amount' => 1000,
        'bank_account_id' => $this->bankAccount->id,
    ];

    $this->post('/cashflow-transactions', $data);

    $cashflow = CashflowTransaction::first();

    expect($cashflow->voucher_number)->not->toBeNull()
        ->and($cashflow->voucher_number)->toMatch('/^R-\d{4}$/');
});

it('validates required fields when creating', function (): void {
    $response = $this->post('/cashflow-transactions', []);

    $response->assertSessionHasErrors(['name', 'date', 'type', 'amount', 'bank_account_id']);
});

it('validates type must be a valid enum value', function (): void {
    $data = [
        'name' => 'Invalid Type',
        'date' => '2025-01-15',
        'type' => 99,
        'amount' => 1000,
        'bank_account_id' => $this->bankAccount->id,
    ];

    $response = $this->post('/cashflow-transactions', $data);

    $response->assertSessionHasErrors(['type']);
});

it('can update a cashflow transaction', function (): void {
    $cashflow = CashflowTransaction::factory()->create([
        'name' => 'Original Name',
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $data = [
        'name' => 'Updated Name',
        'date' => '2025-02-01',
        'type' => CashflowType::CASH_OUT->value,
        'amount' => 3000,
        'bank_account_id' => $this->bankAccount->id,
    ];

    $response = $this->put("/cashflow-transactions/{$cashflow->id}", $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('Cashflow updated successfully.'));

    $this->assertDatabaseHas('cashflow_transactions', [
        'id' => $cashflow->id,
        'name' => 'Updated Name',
        'amount' => 3000,
    ]);
});

it('validates required fields when updating', function (): void {
    $cashflow = CashflowTransaction::factory()->create([
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $response = $this->put("/cashflow-transactions/{$cashflow->id}", []);

    $response->assertSessionHasErrors(['name', 'date', 'type', 'amount', 'bank_account_id']);
});

it('can delete a cashflow transaction', function (): void {
    $cashflow = CashflowTransaction::factory()->create([
        'bank_account_id' => $this->bankAccount->id,
    ]);

    $response = $this->delete("/cashflow-transactions/{$cashflow->id}");

    $response->assertRedirect()
        ->assertSessionHas('success', __('Cashflow deleted successfully.'));

    $this->assertSoftDeleted('cashflow_transactions', [
        'id' => $cashflow->id,
    ]);
});

it('returns 404 when deleting non-existent cashflow transaction', function (): void {
    $response = $this->delete('/cashflow-transactions/9999');

    $response->assertNotFound();
});
