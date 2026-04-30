<?php

declare(strict_types=1);

use App\Models\BankAccount;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    $this->withoutVite();
});

it('can list all bank accounts', function (): void {
    BankAccount::factory()->count(3)->create();

    $response = $this->get('/bank-accounts');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('BankAccount/BankAccounts', false)
            ->has('data.data', 3)
        );
});

it('can filter bank account by search term', function (): void {
    BankAccount::factory()->create(['holder_name' => 'John Doe']);
    BankAccount::factory()->create(['holder_name' => 'Jane Smith']);

    $response = $this->get('/bank-accounts?search=John Doe');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('BankAccount/BankAccounts', false)
            ->has('data.data', 1)
            ->where('data.data.0.holder_name', 'John Doe')
        );
});

it('can paginate bank account', function (): void {
    BankAccount::factory()->count(20)->create();

    $response = $this->get('/bank-accounts?limit=5');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('BankAccount/BankAccounts', false)
            ->has('data.data', 5)
            ->where('data.meta.per_page', 5)
        );
});

it('can create a new bank account', function (): void {
    $data = [
        'holder_name' => 'John Doe',
        'name' => 'Cash',
        'account_number' => '5645346',
        'opening_balance' => 100,
    ];

    $response = $this->post('/bank-accounts', $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('BankAccount added successfully.'));

    $this->assertDatabaseHas('bank_accounts', [
        'holder_name' => 'John Doe',
        'name' => 'Cash',
    ]);
});

it('can create a bank account with additional fields', function (): void {
    $data = [
        'holder_name' => 'John Doe',
        'name' => 'Cash',
        'account_number' => '5645346',
        'opening_balance' => 100,
    ];

    $response = $this->post('/bank-accounts', $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('BankAccount added successfully.'));

    $this->assertDatabaseHas('bank_accounts', [
        'holder_name' => 'John Doe',
        'name' => 'Cash',
        'account_number' => '5645346',
    ]);
});

it('validates required fields when creating a bank account', function (): void {
    $response = $this->post('/bank-accounts', []);

    $response->assertSessionHasErrors(['holder_name', 'opening_balance']);
});

it('can show a specific bank account', function (): void {
    $bankAccount = BankAccount::factory()->create([
        'holder_name' => 'John Doe',
        'opening_balance' => 453435,
    ]);

    $response = $this->getJson("/bank-accounts/{$bankAccount->id}");

    $response->assertSuccessful()
        ->assertJsonPath('data.id', $bankAccount->id)
        ->assertJsonPath('data.holder_name', 'John Doe')
        ->assertJsonPath('data.opening_balance', 453435)
        ->assertJsonStructure([
            'data' => [
                'id',
                'holder_name',
                'name',
                'account_number',
                'opening_balance',
            ],
        ]);
});

it('returns 404 when showing non-existent bank account', function (): void {
    $response = $this->get('/bank-accounts/9999');

    $response->assertNotFound();
});

it('can update a bank account', function (): void {
    $bankAccount = BankAccount::factory()->create([
        'holder_name' => 'John Doe',
    ]);

    $data = [
        'holder_name' => 'John Doe',
        'name' => 'Cash',
        'account_number' => 5645346,
        'opening_balance' => 100,
    ];

    $response = $this->put("/bank-accounts/{$bankAccount->id}", $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('BankAccount updated successfully.'));

    $this->assertDatabaseHas('bank_accounts', [
        'id' => $bankAccount->id,
        'holder_name' => 'John Doe',
        'name' => 'Cash',
    ]);
});

it('validates required fields when updating a bank account', function (): void {
    $bankAccount = BankAccount::factory()->create();

    $response = $this->put("/bank-accounts/{$bankAccount->id}", []);

    $response->assertSessionHasErrors(['holder_name', 'opening_balance']);
});

it('can delete a bank account', function (): void {
    // Create protected bank accounts first (IDs 1 and 2 cannot be deleted)
    BankAccount::factory()->count(2)->create();

    // Create a deletable bank account (ID 3+)
    $bankAccount = BankAccount::factory()->create();

    $response = $this->delete("/bank-accounts/{$bankAccount->id}");

    $response->assertRedirect()
        ->assertSessionHas('success', __('BankAccount deleted successfully.'));

    $this->assertDatabaseMissing('bank_accounts', [
        'id' => $bankAccount->id,
    ]);
});

it('returns 404 when deleting non-existent bank account', function (): void {
    $response = $this->delete('/bank-accounts/9999');

    $response->assertNotFound();
});
