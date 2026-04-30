<?php

declare(strict_types=1);

use App\Filters\SearchFilter;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('filters users by search term across multiple columns', function () {
    User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);
    User::factory()->create(['name' => 'Jane Smith', 'email' => 'jane@example.com']);
    User::factory()->create(['name' => 'Bob Wilson', 'email' => 'bob@test.com']);

    $query = User::query();
    $filter = new SearchFilter('john', ['name', 'email']);

    $result = $filter->handle($query, fn ($q) => $q);

    expect($result->count())->toBe(1)
        ->and($result->first()->name)->toBe('John Doe');
});

it('filters users by search term in email column', function () {
    User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);
    User::factory()->create(['name' => 'Jane Smith', 'email' => 'jane@example.com']);
    User::factory()->create(['name' => 'Bob Wilson', 'email' => 'bob@test.com']);

    $query = User::query();
    $filter = new SearchFilter('example', ['name', 'email']);

    $result = $filter->handle($query, fn ($q) => $q);

    expect($result->count())->toBe(2);
});

it('returns all results when search term is empty', function () {
    User::factory()->count(3)->create();

    $query = User::query();
    $filter = new SearchFilter('', ['name', 'email']);

    $result = $filter->handle($query, fn ($q) => $q);

    expect($result->count())->toBe(3);
});

it('returns all results when columns array is empty', function () {
    User::factory()->count(3)->create();

    $query = User::query();
    $filter = new SearchFilter('test', []);

    $result = $filter->handle($query, fn ($q) => $q);

    expect($result->count())->toBe(3);
});

it('performs case-insensitive search', function () {
    User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);

    $query = User::query();
    $filter = new SearchFilter('JOHN', ['name', 'email']);

    $result = $filter->handle($query, fn ($q) => $q);

    expect($result->count())->toBe(1);
});
