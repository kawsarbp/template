<?php

declare(strict_types=1);

use App\Models\StockPurchase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Maatwebsite\Excel\Facades\Excel;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('can export stock purchases to excel', function (): void {
    Excel::fake();

    StockPurchase::factory()->count(3)->create();

    $response = $this->get('/stock-purchases/export-excel');

    $response->assertSuccessful();
    Excel::assertDownloaded('stock-purchases.xlsx');
});

it('can export stock purchases with filters', function (): void {
    Excel::fake();

    StockPurchase::factory()->count(5)->create();

    $response = $this->get('/stock-purchases/export-excel?search=BATCH');

    $response->assertSuccessful();
    Excel::assertDownloaded('stock-purchases.xlsx');
});
