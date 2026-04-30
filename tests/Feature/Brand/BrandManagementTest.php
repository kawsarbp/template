<?php

declare(strict_types=1);

use App\Enums\VisibilityStatus;
use App\Models\Brand;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    $this->withoutVite();
});

it('can list all brands', function (): void {
    Brand::factory()->count(3)->create();

    $response = $this->get('/brands');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Brand/Brands', false)
            ->has('data.data', 3)
        );
});

it('can filter brands by search term', function (): void {
    Brand::factory()->create(['name' => 'Apple']);
    Brand::factory()->create(['name' => 'Samsung']);

    $response = $this->get('/brands?search=Apple');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Brand/Brands', false)
            ->has('data.data', 1)
            ->where('data.data.0.name', 'Apple')
        );
});

it('can filter brands by active status', function (): void {
    Brand::factory()->create(['name' => 'Active Brand', 'status' => VisibilityStatus::ACTIVE]);
    Brand::factory()->create(['name' => 'Inactive Brand', 'status' => VisibilityStatus::INACTIVE]);

    $response = $this->get('/brands?status='.VisibilityStatus::ACTIVE->value);

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Brand/Brands', false)
            ->has('data.data', 1)
            ->where('data.data.0.name', 'Active Brand')
        );
});

it('can filter brands by inactive status', function (): void {
    Brand::factory()->create(['name' => 'Active Brand', 'status' => VisibilityStatus::ACTIVE]);
    Brand::factory()->create(['name' => 'Inactive Brand', 'status' => VisibilityStatus::INACTIVE]);

    $response = $this->get('/brands?status='.VisibilityStatus::INACTIVE->value);

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Brand/Brands', false)
            ->has('data.data', 1)
            ->where('data.data.0.name', 'Inactive Brand')
        );
});

it('can paginate brands', function (): void {
    Brand::factory()->count(20)->create();

    $response = $this->get('/brands?limit=5');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Brand/Brands', false)
            ->has('data.data', 5)
            ->where('data.meta.per_page', 5)
        );
});

it('can create a new brand', function (): void {
    $data = [
        'name' => 'Apple',
        'status' => VisibilityStatus::ACTIVE->value,
    ];

    $response = $this->post('/brands', $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('Brand added successfully.'));

    $this->assertDatabaseHas('brands', [
        'name' => 'Apple',
        'status' => VisibilityStatus::ACTIVE->value,
    ]);
});

it('validates required fields when creating a brand', function (): void {
    $response = $this->post('/brands', []);

    $response->assertSessionHasErrors(['name', 'status']);
});

it('validates unique name when creating a brand', function (): void {
    Brand::factory()->create(['name' => 'Apple']);

    $data = [
        'name' => 'Apple',
        'status' => VisibilityStatus::ACTIVE->value,
    ];

    $response = $this->post('/brands', $data);

    $response->assertSessionHasErrors(['name']);
});

it('allows duplicate name if previous was soft deleted', function (): void {
    $brand = Brand::factory()->create(['name' => 'Apple']);
    $brand->delete();

    $data = [
        'name' => 'Apple',
        'status' => VisibilityStatus::ACTIVE->value,
    ];

    $response = $this->post('/brands', $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('Brand added successfully.'));
});

it('can show a specific brand', function (): void {
    $brand = Brand::factory()->create(['name' => 'Apple']);

    $response = $this->getJson("/brands/{$brand->id}");

    $response->assertSuccessful()
        ->assertJsonPath('data.id', $brand->id)
        ->assertJsonPath('data.name', 'Apple')
        ->assertJsonStructure([
            'data' => [
                'id',
                'name',
                'status',
                'status_name',
            ],
        ]);
});

it('returns 404 when showing non-existent brand', function (): void {
    $response = $this->get('/brands/999');

    $response->assertNotFound();
});

it('can update a brand', function (): void {
    $brand = Brand::factory()->create(['name' => 'Apple']);

    $data = [
        'name' => 'Samsung',
        'status' => VisibilityStatus::ACTIVE->value,
    ];

    $response = $this->put("/brands/{$brand->id}", $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('Brand updated successfully.'));

    $this->assertDatabaseHas('brands', [
        'id' => $brand->id,
        'name' => 'Samsung',
    ]);
});

it('validates required fields when updating a brand', function (): void {
    $brand = Brand::factory()->create();

    $response = $this->put("/brands/{$brand->id}", []);

    $response->assertSessionHasErrors(['name', 'status']);
});

it('can delete a brand', function (): void {
    $brand = Brand::factory()->create();

    $response = $this->delete("/brands/{$brand->id}");

    $response->assertRedirect()
        ->assertSessionHas('success', __('Brand deleted successfully.'));

    $this->assertSoftDeleted('brands', [
        'id' => $brand->id,
    ]);
});

it('returns 404 when deleting non-existent brand', function (): void {
    $response = $this->delete('/brands/999');

    $response->assertNotFound();
});

it('can search brands via search endpoint', function (): void {
    Brand::factory()->create(['name' => 'Apple', 'status' => VisibilityStatus::ACTIVE]);
    Brand::factory()->create(['name' => 'Samsung', 'status' => VisibilityStatus::ACTIVE]);
    Brand::factory()->create(['name' => 'Nokia', 'status' => VisibilityStatus::INACTIVE]);

    $response = $this->getJson('/search/brands?search=Apple');

    $response->assertSuccessful()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.label', 'Apple');
});

it('search endpoint only returns active brands', function (): void {
    Brand::factory()->create(['name' => 'Apple', 'status' => VisibilityStatus::ACTIVE]);
    Brand::factory()->create(['name' => 'Nokia', 'status' => VisibilityStatus::INACTIVE]);

    $response = $this->getJson('/search/brands');

    $response->assertSuccessful()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.label', 'Apple');
});
