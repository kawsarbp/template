<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Maatwebsite\Excel\Facades\Excel;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('can export products to excel', function (): void {
    Excel::fake();

    Product::factory()->count(3)->create();

    $response = $this->get('/products/export-excel');

    $response->assertSuccessful();

    Excel::assertDownloaded('products.xlsx');
});

it('can export products with filters', function (): void {
    Excel::fake();

    Product::factory()->count(2)->create();

    $response = $this->get('/products/export-excel?status=available');

    $response->assertSuccessful();

    Excel::assertDownloaded('products.xlsx');
});
