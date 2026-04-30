<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('can search users without filters', function (): void {
    User::factory()->count(3)->create();

    $response = $this->getJson('/search/users');

    $response->assertSuccessful()
        ->assertJsonCount(4, 'data') // 3 + 1 authenticated user
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'value',
                    'label',
                ],
            ],
        ]);
});

it('can search users by search term', function (): void {
    User::factory()->create(['name' => 'John Doe']);
    User::factory()->create(['name' => 'Jane Smith']);
    User::factory()->create(['name' => 'Bob Wilson']);

    $response = $this->getJson('/search/users?search=John');

    $response->assertSuccessful()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.label', 'John Doe');
});

it('limits search results to 20 users', function (): void {
    User::factory()->count(25)->create();

    $response = $this->getJson('/search/users');

    $response->assertSuccessful()
        ->assertJsonCount(20, 'data');
});

it('returns users with correct structure', function (): void {
    $user = User::factory()->create(['name' => 'Test User']);

    $response = $this->getJson('/search/users?sort_by=id&sort_direction=desc');

    $response->assertSuccessful()
        ->assertJsonPath('data.0.value', $user->id)
        ->assertJsonPath('data.0.label', 'Test User');
});

it('returns empty array when no users match search', function (): void {
    User::factory()->create(['name' => 'John Doe']);

    $response = $this->getJson('/search/users?search=NonExistent');

    $response->assertSuccessful()
        ->assertJsonCount(0, 'data');
});
