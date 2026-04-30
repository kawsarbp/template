<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\Stock;
use App\Models\StockPurchase;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

function createCsvFile(array $rows, array $headers = ['sku', 'unit_price', 'sale_price', 'condition', 'imei']): UploadedFile
{
    $content = "sep=,\n".implode(',', $headers)."\n";
    foreach ($rows as $row) {
        $content .= implode(',', $row)."\n";
    }

    $tempFile = tempnam(sys_get_temp_dir(), 'csv_');
    file_put_contents($tempFile, $content);

    return new UploadedFile($tempFile, 'import.csv', 'text/csv', null, true);
}

it('can import stock purchases from a valid CSV', function (): void {
    $supplier = Supplier::factory()->create();
    $product1 = Product::factory()->create(['sku' => 'SKU-001']);
    $product2 = Product::factory()->create(['sku' => 'SKU-002']);

    $file = createCsvFile([
        ['SKU-001', '150.00', '200.00', 'Excellent', '111111111111111'],
        ['SKU-001', '150.00', '200.00', 'Excellent', '222222222222222'],
        ['SKU-002', '100.00', '150.00', 'Very Good', '333333333333333'],
    ]);

    $response = $this->post('/stock-purchases/import-csv', [
        'batch_number' => 'GLOT-001',
        'supplier_id' => $supplier->id,
        'purchase_date' => '2026-01-15',
        'discount' => 10,
        'notes' => 'Test import',
        'file' => $file,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect(StockPurchase::count())->toBe(1);

    $purchase = StockPurchase::first();
    expect($purchase->batch_number)->toBe('GLOT-001');
    expect($purchase->supplier_id)->toBe($supplier->id);
    expect($purchase->total_units)->toBe(3);
    expect((float) $purchase->discount)->toBe(10.0);

    expect(Stock::count())->toBe(3);
    expect(Stock::where('imei', '111111111111111')->exists())->toBeTrue();
    expect(Stock::where('imei', '222222222222222')->exists())->toBeTrue();
    expect(Stock::where('imei', '333333333333333')->exists())->toBeTrue();

    $items = $purchase->items;
    expect($items)->toHaveCount(2);

    $sku001Item = $items->where('product_id', $product1->id)->first();
    expect($sku001Item->quantity)->toBe(2);
    expect((float) $sku001Item->unit_price)->toBe(150.0);

    $sku002Item = $items->where('product_id', $product2->id)->first();
    expect($sku002Item->quantity)->toBe(1);
});

it('fails validation when SKU does not exist', function (): void {
    $supplier = Supplier::factory()->create();

    $file = createCsvFile([
        ['NONEXISTENT', '150.00', '200.00', 'Excellent', '111111111111111'],
    ]);

    $response = $this->post('/stock-purchases/import-csv', [
        'batch_number' => 'GLOT-002',
        'supplier_id' => $supplier->id,
        'purchase_date' => '2026-01-15',
        'file' => $file,
    ]);

    $response->assertSessionHasErrors();
});

it('fails validation when IMEI is duplicated in CSV', function (): void {
    $supplier = Supplier::factory()->create();
    Product::factory()->create(['sku' => 'SKU-001']);

    $file = createCsvFile([
        ['SKU-001', '150.00', '200.00', 'Excellent', '111111111111111'],
        ['SKU-001', '150.00', '200.00', 'Excellent', '111111111111111'],
    ]);

    $response = $this->post('/stock-purchases/import-csv', [
        'batch_number' => 'GLOT-003',
        'supplier_id' => $supplier->id,
        'purchase_date' => '2026-01-15',
        'file' => $file,
    ]);

    $response->assertSessionHasErrors();
});

it('fails validation when IMEI already exists in database', function (): void {
    $supplier = Supplier::factory()->create();
    $product = Product::factory()->create(['sku' => 'SKU-001']);

    Stock::factory()->create(['imei' => '111111111111111', 'product_id' => $product->id]);

    $file = createCsvFile([
        ['SKU-001', '150.00', '200.00', 'Excellent', '111111111111111'],
    ]);

    $response = $this->post('/stock-purchases/import-csv', [
        'batch_number' => 'GLOT-004',
        'supplier_id' => $supplier->id,
        'purchase_date' => '2026-01-15',
        'file' => $file,
    ]);

    $response->assertSessionHasErrors();
});

it('fails validation with invalid condition', function (): void {
    $supplier = Supplier::factory()->create();
    Product::factory()->create(['sku' => 'SKU-001']);

    $file = createCsvFile([
        ['SKU-001', '150.00', '200.00', 'InvalidCondition', '111111111111111'],
    ]);

    $response = $this->post('/stock-purchases/import-csv', [
        'batch_number' => 'GLOT-005',
        'supplier_id' => $supplier->id,
        'purchase_date' => '2026-01-15',
        'file' => $file,
    ]);

    $response->assertSessionHasErrors();
});

it('fails validation when required form fields are missing', function (): void {
    $response = $this->post('/stock-purchases/import-csv', []);

    $response->assertSessionHasErrors(['batch_number', 'supplier_id', 'purchase_date', 'file']);
});

it('correctly groups rows by sku, unit_price, sale_price, and condition', function (): void {
    $supplier = Supplier::factory()->create();
    $product = Product::factory()->create(['sku' => 'SKU-001']);

    $file = createCsvFile([
        ['SKU-001', '100.00', '150.00', 'Excellent', '111111111111111'],
        ['SKU-001', '100.00', '150.00', 'Excellent', '222222222222222'],
        ['SKU-001', '100.00', '150.00', 'Good', '333333333333333'],
        ['SKU-001', '200.00', '250.00', 'Excellent', '444444444444444'],
    ]);

    $response = $this->post('/stock-purchases/import-csv', [
        'batch_number' => 'GLOT-006',
        'supplier_id' => $supplier->id,
        'purchase_date' => '2026-01-15',
        'file' => $file,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $purchase = StockPurchase::first();
    expect($purchase->items)->toHaveCount(3);
    expect($purchase->total_units)->toBe(4);
    expect(Stock::count())->toBe(4);
});
