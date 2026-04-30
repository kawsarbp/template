<?php

declare(strict_types=1);

use App\Enums\VisibilityStatus;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('can search customers without filters', function (): void {
    Customer::factory()->count(3)->create(['status' => VisibilityStatus::ACTIVE]);

    $response = $this->getJson('/search/customers');

    $response->assertSuccessful()
        ->assertJsonCount(3, 'data')
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'value',
                    'label',
                ],
            ],
        ]);
});

it('can search customers by search term on name', function (): void {
    Customer::factory()->create(['name' => 'John Doe', 'status' => VisibilityStatus::ACTIVE]);
    Customer::factory()->create(['name' => 'Jane Smith', 'status' => VisibilityStatus::ACTIVE]);
    Customer::factory()->create(['name' => 'Bob Wilson', 'status' => VisibilityStatus::ACTIVE]);

    $response = $this->getJson('/search/customers?search=John');

    $response->assertSuccessful()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.label', 'John Doe');
});

it('limits search results to 20 customers', function (): void {
    Customer::factory()->count(25)->create(['status' => VisibilityStatus::ACTIVE]);

    $response = $this->getJson('/search/customers');

    $response->assertSuccessful()
        ->assertJsonCount(20, 'data');
});

it('returns customers with correct structure', function (): void {
    $customer = Customer::factory()->create([
        'name' => 'Test Customer',
        'status' => VisibilityStatus::ACTIVE,
    ]);

    $response = $this->getJson('/search/customers');

    $response->assertSuccessful()
        ->assertJsonPath('data.0.value', $customer->id)
        ->assertJsonPath('data.0.label', 'Test Customer');
});

it('returns empty array when no customers match search', function (): void {
    Customer::factory()->create(['name' => 'John Doe', 'status' => VisibilityStatus::ACTIVE]);

    $response = $this->getJson('/search/customers?search=NonExistent');

    $response->assertSuccessful()
        ->assertJsonCount(0, 'data');
});
