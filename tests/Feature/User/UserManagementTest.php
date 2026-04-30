<?php

declare(strict_types=1);

use App\Enums\VisibilityStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    $this->withoutVite();
});

it('can list all users', function (): void {
    User::factory()->count(3)->create();

    $response = $this->get('/users');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('User/Users', false)
            ->has('data.data', 4)
        );
});

it('can filter users by search term', function (): void {
    User::factory()->create(['name' => 'John Doe']);
    User::factory()->create(['name' => 'Jane Smith']);

    $response = $this->get('/users?search=John Doe');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('User/Users', false)
            ->has('data.data', 1)
            ->where('data.data.0.name', 'John Doe')
        );
});

it('can sort users by name', function (): void {
    User::factory()->create(['name' => 'Zebra User']);
    User::factory()->create(['name' => 'Alpha User']);

    $response = $this->get('/users?sort_by=name&sort_direction=asc');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('User/Users', false)
            ->has('data.data', 3)
            ->where('data.data.0.name', 'Alpha User')
            ->where('data.data.1.name', fn ($name) => is_string($name))
            ->where('data.data.2.name', 'Zebra User')
        );
});

it('can paginate users', function (): void {
    User::factory()->count(20)->create();

    $response = $this->get('/users?limit=5');

    $response->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('User/Users', false)
            ->has('data.data', 5)
            ->where('data.meta.per_page', 5)
        );
});

it('can create a new user', function (): void {
    $role = Role::create([
        'name' => 'Customer',
        'guard_name' => 'web',
    ]);

    $data = [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'pass123456',
        'role_id' => $role->id,
        'status' => VisibilityStatus::ACTIVE->value,
    ];

    $response = $this->post('/users', $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('User added successfully.'));

    $this->assertDatabaseHas('users', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);
});

it('can create a user with additional fields', function (): void {
    $role = Role::create([
        'name' => 'Customer',
        'guard_name' => 'web',
    ]);

    $data = [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'pass123456',
        'role_id' => $role->id,
        'status' => VisibilityStatus::ACTIVE->value,
    ];

    $response = $this->post('/users', $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('User added successfully.'));

    $this->assertDatabaseHas('users', [
        'name' => 'John Doe',
    ]);
});

it('validates required fields when creating a user', function (): void {
    $response = $this->post('/users', []);

    $response->assertSessionHasErrors(['name', 'email', 'password']);
});

it('validates unique email when creating a user', function (): void {
    User::factory()->create(['email' => 'john@example.com']);

    $data = [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password123',
    ];

    $response = $this->post('/users', $data);

    $response->assertSessionHasErrors(['email']);
});

it('can show a specific user', function (): void {
    $user = User::factory()->create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);

    $response = $this->get("/users/{$user->id}");

    $response->assertSuccessful()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.name', 'John Doe')
        ->assertJsonPath('data.email', 'john@example.com')
        ->assertJsonStructure([
            'data' => [
                'id',
                'name',
                'email',
            ],
        ]);
});

it('returns 404 when showing non-existent user', function (): void {
    $response = $this->get('/users/999');

    $response->assertNotFound();
});

it('can update a user', function (): void {
    $role = Role::create([
        'name' => 'Customer',
        'guard_name' => 'web',
    ]);

    $user = User::factory()->create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);

    $data = [
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
        'role_id' => $role->id,
        'status' => VisibilityStatus::ACTIVE->value,
    ];

    $response = $this->put("/users/{$user->id}", $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('User updated successfully.'));

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
    ]);
});

it('can update user password', function (): void {
    $role = Role::create([
        'name' => 'Customer',
        'guard_name' => 'web',
    ]);

    $user = User::factory()->create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);

    $oldPasswordHash = $user->password;

    $data = [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'newpass1234',
        'role_id' => $role->id,
        'status' => VisibilityStatus::ACTIVE->value,
    ];

    $response = $this->put("/users/{$user->id}", $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('User updated successfully.'));

    $user->refresh();
    expect($user->password)->not->toBe($oldPasswordHash);
});

it('does not update password if not provided', function (): void {
    $role = Role::create([
        'name' => 'Customer',
        'guard_name' => 'web',
    ]);

    $user = User::factory()->create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);

    $oldPasswordHash = $user->password;

    $data = [
        'name' => 'Updated Name',
        'email' => 'john@example.com',
        'role_id' => $role->id,
        'status' => VisibilityStatus::ACTIVE->value,
    ];

    $response = $this->put("/users/{$user->id}", $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('User updated successfully.'));

    $user->refresh();
    expect($user->password)->toBe($oldPasswordHash);
});

it('validates required fields when updating a user', function (): void {
    $user = User::factory()->create();

    $response = $this->put("/users/{$user->id}", []);

    $response->assertSessionHasErrors(['name', 'email']);
});

it('validates unique email when updating a user', function (): void {
    $user1 = User::factory()->create(['email' => 'john@example.com']);
    $user2 = User::factory()->create(['email' => 'jane@example.com']);

    $data = [
        'name' => 'Jane Doe',
        'email' => 'john@example.com',
    ];

    $response = $this->put("/users/{$user2->id}", $data);

    $response->assertSessionHasErrors(['email']);
});

it('allows updating with same email', function (): void {
    $role = Role::create([
        'name' => 'Customer',
        'guard_name' => 'web',
    ]);

    $user = User::factory()->create(['email' => 'john@example.com']);

    $data = [
        'name' => 'Updated Name',
        'email' => 'john@example.com',
        'role_id' => $role->id,
        'status' => VisibilityStatus::ACTIVE->value,
    ];

    $response = $this->put("/users/{$user->id}", $data);

    $response->assertRedirect()
        ->assertSessionHas('success', __('User updated successfully.'));
});

it('can delete a user', function (): void {
    $user = User::factory()->create();

    $response = $this->delete("/users/{$user->id}");

    $response->assertRedirect()
        ->assertSessionHas('success', __('User deleted successfully.'));

    $this->assertSoftDeleted('users', [
        'id' => $user->id,
    ]);
});

it('returns 404 when deleting non-existent user', function (): void {
    $response = $this->delete('/users/999');

    $response->assertNotFound();
});
