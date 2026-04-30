<?php

declare(strict_types=1);

use App\Enums\VisibilityStatus;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    $this->withoutVite();
});

it('can list all customers', function (): void {
    Customer::factory()->count(3)->create();

    $response = $this->get('/customers');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Customers', false)
            ->has('data.data', 3)
        );
});

it('can filter customers by search term', function (): void {
    Customer::factory()->create(['name' => 'John Doe']);
    Customer::factory()->create(['name' => 'Jane Smith']);

    $response = $this->get('/customers?search=John Doe');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Customers', false)
            ->has('data.data', 1)
            ->where('data.data.0.name', 'John Doe')
        );
});

it('can filter customers by active status', function (): void {
    Customer::factory()->create(['name' => 'Active Customer', 'status' => VisibilityStatus::ACTIVE]);
    Customer::factory()->create(['name' => 'Inactive Customer', 'status' => VisibilityStatus::INACTIVE]);

    $response = $this->get('/customers?status='.VisibilityStatus::ACTIVE->value);

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Customers', false)
            ->has('data.data', 1)
            ->where('data.data.0.name', 'Active Customer')
        );
});

it('can filter customers by inactive status', function (): void {
    Customer::factory()->create(['name' => 'Active Customer', 'status' => VisibilityStatus::ACTIVE]);
    Customer::factory()->create(['name' => 'Inactive Customer', 'status' => VisibilityStatus::INACTIVE]);

    $response = $this->get('/customers?status='.VisibilityStatus::INACTIVE->value);

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Customers', false)
            ->has('data.data', 1)
            ->where('data.data.0.name', 'Inactive Customer')
        );
});

it('can paginate customers', function (): void {
    Customer::factory()->count(20)->create();

    $response = $this->get('/customers?limit=5');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Customers', false)
            ->has('data.data', 5)
            ->where('data.meta.per_page', 5)
        );
});

it('can create a new customer', function (): void {
    $data = [
        'name' => 'John Doe',
        'phone' => '123-456-7890',
        'email' => 'john@example.com',
        'status' => VisibilityStatus::ACTIVE->value,
    ];

    $response = $this->post('/customers', $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('Customer added successfully.'));

    $this->assertDatabaseHas('customers', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);
});

it('can create a customer with additional fields', function (): void {
    $data = [
        'name' => 'John Doe',
        'phone' => '123-456-7890',
        'email' => 'john@example.com',
        'status' => VisibilityStatus::ACTIVE->value,
        'company_name' => 'Doe Enterprises',
        'address' => '123 Main St',
        'city' => 'New York',
    ];

    $response = $this->post('/customers', $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('Customer added successfully.'));

    $this->assertDatabaseHas('customers', [
        'name' => 'John Doe',
        'company_name' => 'Doe Enterprises',
        'city' => 'New York',
    ]);
});

it('validates required fields when creating a customer', function (): void {
    $response = $this->post('/customers', []);

    $response->assertSessionHasErrors(['name', 'email', 'status']);
});

it('validates unique email when creating a customer', function (): void {
    Customer::factory()->create(['email' => 'john@example.com']);

    $data = [
        'name' => 'John Doe',
        'phone' => '123-456-7890',
        'email' => 'john@example.com',
        'status' => VisibilityStatus::ACTIVE->value,
    ];

    $response = $this->post('/customers', $data);

    $response->assertSessionHasErrors(['email']);
});

it('can show a specific customer', function (): void {
    $customer = Customer::factory()->create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);

    $response = $this->getJson("/customers/{$customer->id}");

    $response->assertSuccessful()
        ->assertJsonPath('data.id', $customer->id)
        ->assertJsonPath('data.name', 'John Doe')
        ->assertJsonPath('data.email', 'john@example.com')
        ->assertJsonStructure([
            'data' => [
                'id',
                'customer_id',
                'name',
                'phone',
                'email',
                'status',
            ],
        ]);
});

it('returns 404 when showing non-existent customer', function (): void {
    $response = $this->get('/customers/999');

    $response->assertNotFound();
});

it('can update a customer', function (): void {
    $customer = Customer::factory()->create([
        'name' => 'John Doe',
    ]);

    $data = [
        'name' => 'Updated Name',
        'phone' => '098-765-4321',
        'email' => 'updated@example.com',
        'status' => VisibilityStatus::ACTIVE->value,
    ];

    $response = $this->put("/customers/{$customer->id}", $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('Customer updated successfully.'));

    $this->assertDatabaseHas('customers', [
        'id' => $customer->id,
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
    ]);
});

it('validates required fields when updating a customer', function (): void {
    $customer = Customer::factory()->create();

    $response = $this->put("/customers/{$customer->id}", []);

    $response->assertSessionHasErrors(['name', 'email', 'status']);
});

it('can delete a customer', function (): void {
    $customer = Customer::factory()->create();

    $response = $this->delete("/customers/{$customer->id}");

    $response->assertRedirect()
        ->assertSessionHas('success', __('Customer deleted successfully.'));

    $this->assertSoftDeleted('customers', [
        'id' => $customer->id,
    ]);
});

it('returns 404 when deleting non-existent customer', function (): void {
    $response = $this->delete('/customers/999');

    $response->assertNotFound();
});
