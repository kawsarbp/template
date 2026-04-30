<?php

declare(strict_types=1);

use App\Enums\Currency;
use App\Enums\VisibilityStatus;
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

it('can list all suppliers', function (): void {
    Supplier::factory()->count(3)->create();

    $response = $this->get('/suppliers');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Supplier/Suppliers', false)
            ->has('data.data', 3)
        );
});

it('can filter suppliers by search term', function (): void {
    Supplier::factory()->create(['name' => 'John Doe']);
    Supplier::factory()->create(['name' => 'Jane Smith']);

    $response = $this->get('/suppliers?search=John Doe');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Supplier/Suppliers', false)
            ->has('data.data', 1)
            ->where('data.data.0.name', 'John Doe')
        );
});

it('can filter suppliers by active status', function (): void {
    Supplier::factory()->create(['name' => 'Active Supplier', 'status' => VisibilityStatus::ACTIVE]);
    Supplier::factory()->create(['name' => 'Inactive Supplier', 'status' => VisibilityStatus::INACTIVE]);

    $response = $this->get('/suppliers?status='.VisibilityStatus::ACTIVE->value);

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Supplier/Suppliers', false)
            ->has('data.data', 1)
            ->where('data.data.0.name', 'Active Supplier')
        );
});

it('can filter suppliers by inactive status', function (): void {
    Supplier::factory()->create(['name' => 'Active Supplier', 'status' => VisibilityStatus::ACTIVE]);
    Supplier::factory()->create(['name' => 'Inactive Supplier', 'status' => VisibilityStatus::INACTIVE]);

    $response = $this->get('/suppliers?status='.VisibilityStatus::INACTIVE->value);

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Supplier/Suppliers', false)
            ->has('data.data', 1)
            ->where('data.data.0.name', 'Inactive Supplier')
        );
});

it('can paginate suppliers', function (): void {
    Supplier::factory()->count(20)->create();

    $response = $this->get('/suppliers?limit=5');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Supplier/Suppliers', false)
            ->has('data.data', 5)
            ->where('data.meta.per_page', 5)
        );
});

it('can create a new supplier', function (): void {
    $data = [
        'name' => 'John Doe',
        'phone' => '123-456-7890',
        'email' => 'john@example.com',
        'currency' => Currency::AED->value,
        'status' => VisibilityStatus::ACTIVE->value,
    ];

    $response = $this->post('/suppliers', $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('Supplier added successfully.'));

    $this->assertDatabaseHas('suppliers', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);
});

it('can create a supplier with additional fields', function (): void {
    $data = [
        'name' => 'John Doe',
        'phone' => '123-456-7890',
        'email' => 'john@example.com',
        'currency' => Currency::HKD->value,
        'status' => VisibilityStatus::ACTIVE->value,
        'company_name' => 'Doe Enterprises',
        'address' => '123 Main St',
    ];

    $response = $this->post('/suppliers', $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('Supplier added successfully.'));

    $this->assertDatabaseHas('suppliers', [
        'name' => 'John Doe',
        'company_name' => 'Doe Enterprises',
    ]);
});

it('validates required fields when creating a supplier', function (): void {
    $response = $this->post('/suppliers', []);

    $response->assertSessionHasErrors(['name', 'currency', 'status']);
});

it('validates unique email when creating a supplier', function (): void {
    Supplier::factory()->create(['email' => 'john@example.com']);

    $data = [
        'name' => 'John Doe',
        'phone' => '123-456-7890',
        'email' => 'john@example.com',
        'currency' => Currency::AED->value,
        'status' => VisibilityStatus::ACTIVE->value,
    ];

    $response = $this->post('/suppliers', $data);

    $response->assertSessionHasErrors(['email']);
});

it('can show a specific supplier', function (): void {
    $supplier = Supplier::factory()->create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);

    $response = $this->getJson("/suppliers/{$supplier->id}");

    $response->assertSuccessful()
        ->assertJsonPath('data.id', $supplier->id)
        ->assertJsonPath('data.name', 'John Doe')
        ->assertJsonPath('data.email', 'john@example.com')
        ->assertJsonStructure([
            'data' => [
                'id',
                'supplier_id',
                'name',
                'phone',
                'email',
                'status',
            ],
        ]);
});

it('returns 404 when showing non-existent supplier', function (): void {
    $response = $this->get('/suppliers/999');

    $response->assertNotFound();
});

it('can update a supplier', function (): void {
    $supplier = Supplier::factory()->create([
        'name' => 'John Doe',
    ]);

    $data = [
        'name' => 'Updated Name',
        'phone' => '098-765-4321',
        'email' => 'updated@example.com',
        'currency' => Currency::HKD->value,
        'status' => VisibilityStatus::ACTIVE->value,
    ];

    $response = $this->put("/suppliers/{$supplier->id}", $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('Supplier updated successfully.'));

    $this->assertDatabaseHas('suppliers', [
        'id' => $supplier->id,
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
    ]);
});

it('validates required fields when updating a supplier', function (): void {
    $supplier = Supplier::factory()->create();

    $response = $this->put("/suppliers/{$supplier->id}", []);

    $response->assertSessionHasErrors(['name', 'currency', 'status']);
});

it('validates currency must be a valid value', function (): void {
    $supplier = Supplier::factory()->create();

    $response = $this->put("/suppliers/{$supplier->id}", [
        'name' => 'Test',
        'currency' => 'INVALID',
        'status' => VisibilityStatus::ACTIVE->value,
    ]);

    $response->assertSessionHasErrors(['currency']);
});

it('can create a supplier with HKD currency', function (): void {
    $data = [
        'name' => 'HKD Supplier',
        'currency' => Currency::HKD->value,
        'status' => VisibilityStatus::ACTIVE->value,
    ];

    $response = $this->post('/suppliers', $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('Supplier added successfully.'));

    $this->assertDatabaseHas('suppliers', [
        'name' => 'HKD Supplier',
        'currency' => Currency::HKD->value,
    ]);
});

it('returns currency in supplier detail response', function (): void {
    $supplier = Supplier::factory()->create([
        'currency' => Currency::HKD->value,
    ]);

    $response = $this->getJson("/suppliers/{$supplier->id}");

    $response->assertSuccessful()
        ->assertJsonPath('data.currency', Currency::HKD->value);
});

it('can delete a supplier', function (): void {
    $supplier = Supplier::factory()->create();

    $response = $this->delete("/suppliers/{$supplier->id}");

    $response->assertRedirect()
        ->assertSessionHas('success', __('Supplier deleted successfully.'));

    $this->assertSoftDeleted('suppliers', [
        'id' => $supplier->id,
    ]);
});

it('returns 404 when deleting non-existent supplier', function (): void {
    $response = $this->delete('/suppliers/999');

    $response->assertNotFound();
});
