<?php

declare(strict_types=1);

use App\Enums\SaleType;
use App\Enums\StockStatus;
use App\Models\BankAccount;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Stock;
use App\Models\StockPurchase;
use App\Models\StockPurchaseItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

function makeSaleCsvFile(string $content): UploadedFile
{
    $path = tempnam(sys_get_temp_dir(), 'sale_import_');
    file_put_contents($path, $content);

    return new UploadedFile($path, 'sale-import.csv', 'text/csv', null, true);
}

it('imports a sale with imei line items', function (): void {
    $stock = Stock::factory()->create([
        'imei' => '111222333444555',
        'status' => StockStatus::AVAILABLE,
    ]);

    $csv = "sep=,\ntype,identifier,sale_price,quantity\nimei,111222333444555,250.00,1\n";

    $response = $this->post('/sales/import-csv', [
        'sale_type' => SaleType::Retail->value,
        'sale_date' => '2026-04-08',
        'file' => makeSaleCsvFile($csv),
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect(Sale::count())->toBe(1);
    expect(SaleItem::count())->toBe(1);
    expect(SaleItem::first()->stock_id)->toBe($stock->id);
    expect(SaleItem::first()->source_type)->toBe('stock');
    expect((float) SaleItem::first()->sale_price)->toBe(250.0);
    expect(Stock::find($stock->id)->status)->toBe(StockStatus::SOLD);
});

it('imports a sale with glot line items using all available stocks', function (): void {
    $stockPurchase = StockPurchase::factory()->create(['batch_number' => 'BATCH-20260101-0001']);
    $purchaseItem = StockPurchaseItem::factory()->create(['stock_purchase_id' => $stockPurchase->id]);

    $stocks = Stock::factory()->count(3)->create([
        'stock_purchase_item_id' => $purchaseItem->id,
        'status' => StockStatus::AVAILABLE,
    ]);

    $csv = "sep=,\ntype,identifier,sale_price,quantity\nglot,BATCH-20260101-0001,150.00,3\n";

    $response = $this->post('/sales/import-csv', [
        'sale_type' => SaleType::Bulk->value,
        'sale_date' => '2026-04-08',
        'file' => makeSaleCsvFile($csv),
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect(Sale::count())->toBe(1);
    expect(SaleItem::count())->toBe(3);
    expect(Sale::first()->total_units)->toBe(3);
    expect(SaleItem::first()->source_type)->toBe('glot');
    expect(SaleItem::first()->stock_purchase_id)->toBe($stockPurchase->id);
    $stocks->each(fn ($s) => expect(Stock::find($s->id)->status)->toBe(StockStatus::SOLD));
});

it('imports a sale with mixed imei and glot line items', function (): void {
    Stock::factory()->create([
        'imei' => '999888777666555',
        'status' => StockStatus::AVAILABLE,
    ]);

    $stockPurchase = StockPurchase::factory()->create(['batch_number' => 'BATCH-20260101-0002']);
    $purchaseItem = StockPurchaseItem::factory()->create(['stock_purchase_id' => $stockPurchase->id]);
    Stock::factory()->count(2)->create([
        'stock_purchase_item_id' => $purchaseItem->id,
        'status' => StockStatus::AVAILABLE,
    ]);

    $csv = "sep=,\ntype,identifier,sale_price,quantity\nimei,999888777666555,200.00,1\nglot,BATCH-20260101-0002,100.00,2\n";

    $response = $this->post('/sales/import-csv', [
        'sale_type' => SaleType::Retail->value,
        'sale_date' => '2026-04-08',
        'file' => makeSaleCsvFile($csv),
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect(Sale::count())->toBe(1);
    expect(SaleItem::count())->toBe(3); // 1 imei + 2 glot stocks
});

it('applies discount and payment on import', function (): void {
    BankAccount::factory()->create(['id' => BankAccount::CASH]);

    Stock::factory()->create([
        'imei' => '123456789012300',
        'status' => StockStatus::AVAILABLE,
    ]);

    $csv = "sep=,\ntype,identifier,sale_price,quantity\nimei,123456789012300,500.00,1\n";

    $response = $this->post('/sales/import-csv', [
        'sale_type' => SaleType::Retail->value,
        'sale_date' => '2026-04-08',
        'discount' => 50,
        'payment' => 200,
        'file' => makeSaleCsvFile($csv),
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $sale = Sale::first();
    expect((float) $sale->discount)->toBe(50.0);
    expect((float) $sale->total_amount)->toBe(500.0);
    expect((float) $sale->total_due)->toBe(250.0); // 500 - 50 - 200
    expect((float) $sale->total_paid)->toBe(200.0);
});

it('rejects invalid type in csv row', function (): void {
    $csv = "sep=,\ntype,identifier,sale_price,quantity\nunknown,ABC123,100.00,1\n";

    $response = $this->post('/sales/import-csv', [
        'sale_type' => SaleType::Retail->value,
        'sale_date' => '2026-04-08',
        'file' => makeSaleCsvFile($csv),
    ]);

    $response->assertSessionHasErrors(['row_3_type']);
});

it('rejects non-existent imei', function (): void {
    $csv = "sep=,\ntype,identifier,sale_price,quantity\nimei,DOESNOTEXIST,100.00,1\n";

    $response = $this->post('/sales/import-csv', [
        'sale_type' => SaleType::Retail->value,
        'sale_date' => '2026-04-08',
        'file' => makeSaleCsvFile($csv),
    ]);

    $response->assertSessionHasErrors(['row_3_identifier']);
});

it('rejects sold imei', function (): void {
    Stock::factory()->create([
        'imei' => '555444333222111',
        'status' => StockStatus::SOLD,
    ]);

    $csv = "sep=,\ntype,identifier,sale_price,quantity\nimei,555444333222111,100.00,1\n";

    $response = $this->post('/sales/import-csv', [
        'sale_type' => SaleType::Retail->value,
        'sale_date' => '2026-04-08',
        'file' => makeSaleCsvFile($csv),
    ]);

    $response->assertSessionHasErrors(['row_3_identifier']);
});

it('rejects non-existent glot', function (): void {
    $csv = "sep=,\ntype,identifier,sale_price,quantity\nglot,BATCH-NONEXISTENT,100.00,1\n";

    $response = $this->post('/sales/import-csv', [
        'sale_type' => SaleType::Retail->value,
        'sale_date' => '2026-04-08',
        'file' => makeSaleCsvFile($csv),
    ]);

    $response->assertSessionHasErrors(['row_3_identifier']);
});

it('rejects glot with no available stock', function (): void {
    $stockPurchase = StockPurchase::factory()->create(['batch_number' => 'BATCH-20260101-0099']);
    $purchaseItem = StockPurchaseItem::factory()->create(['stock_purchase_id' => $stockPurchase->id]);
    Stock::factory()->create([
        'stock_purchase_item_id' => $purchaseItem->id,
        'status' => StockStatus::SOLD,
    ]);

    $csv = "sep=,\ntype,identifier,sale_price,quantity\nglot,BATCH-20260101-0099,100.00,1\n";

    $response = $this->post('/sales/import-csv', [
        'sale_type' => SaleType::Retail->value,
        'sale_date' => '2026-04-08',
        'file' => makeSaleCsvFile($csv),
    ]);

    $response->assertSessionHasErrors(['row_3_identifier']);
});

it('rejects imei quantity not equal to 1', function (): void {
    Stock::factory()->create([
        'imei' => '123123123123123',
        'status' => StockStatus::AVAILABLE,
    ]);

    $csv = "sep=,\ntype,identifier,sale_price,quantity\nimei,123123123123123,100.00,2\n";

    $response = $this->post('/sales/import-csv', [
        'sale_type' => SaleType::Retail->value,
        'sale_date' => '2026-04-08',
        'file' => makeSaleCsvFile($csv),
    ]);

    $response->assertSessionHasErrors(['row_3_quantity']);
});

it('rejects glot quantity not matching available stock count', function (): void {
    $stockPurchase = StockPurchase::factory()->create(['batch_number' => 'BATCH-20260101-0050']);
    $purchaseItem = StockPurchaseItem::factory()->create(['stock_purchase_id' => $stockPurchase->id]);
    Stock::factory()->count(3)->create([
        'stock_purchase_item_id' => $purchaseItem->id,
        'status' => StockStatus::AVAILABLE,
    ]);

    $csv = "sep=,\ntype,identifier,sale_price,quantity\nglot,BATCH-20260101-0050,100.00,5\n";

    $response = $this->post('/sales/import-csv', [
        'sale_type' => SaleType::Retail->value,
        'sale_date' => '2026-04-08',
        'file' => makeSaleCsvFile($csv),
    ]);

    $response->assertSessionHasErrors(['row_3_quantity']);
});

it('rejects missing quantity', function (): void {
    $csv = "sep=,\ntype,identifier,sale_price,quantity\nimei,123456789012345,100.00,\n";

    $response = $this->post('/sales/import-csv', [
        'sale_type' => SaleType::Retail->value,
        'sale_date' => '2026-04-08',
        'file' => makeSaleCsvFile($csv),
    ]);

    $response->assertSessionHasErrors(['row_3_quantity']);
});

it('rejects payment exceeding grand total', function (): void {
    Stock::factory()->create([
        'imei' => '111000999888777',
        'status' => StockStatus::AVAILABLE,
    ]);

    $csv = "sep=,\ntype,identifier,sale_price,quantity\nimei,111000999888777,100.00,1\n";

    $response = $this->post('/sales/import-csv', [
        'sale_type' => SaleType::Retail->value,
        'sale_date' => '2026-04-08',
        'payment' => 200,
        'file' => makeSaleCsvFile($csv),
    ]);

    $response->assertSessionHasErrors(['payment']);
});

it('rejects empty csv file', function (): void {
    $csv = "sep=,\ntype,identifier,sale_price,quantity\n";

    $response = $this->post('/sales/import-csv', [
        'sale_type' => SaleType::Retail->value,
        'sale_date' => '2026-04-08',
        'file' => makeSaleCsvFile($csv),
    ]);

    $response->assertSessionHasErrors(['file']);
});

it('requires sale_type and sale_date', function (): void {
    $csv = "sep=,\ntype,identifier,sale_price,quantity\n";

    $response = $this->post('/sales/import-csv', [
        'file' => makeSaleCsvFile($csv),
    ]);

    $response->assertSessionHasErrors(['sale_type', 'sale_date']);
});
