<?php

declare(strict_types=1);

use App\Models\Brand;
use App\Models\Color;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

function createProductCsvFile(array $rows, array $headers = ['title', 'sku', 'brand', 'model', 'color', 'condition', 'is_active']): UploadedFile
{
    $content = "sep=,\n".implode(',', $headers)."\n";
    foreach ($rows as $row) {
        $content .= implode(',', $row)."\n";
    }

    $tempFile = tempnam(sys_get_temp_dir(), 'csv_');
    file_put_contents($tempFile, $content);

    return new UploadedFile($tempFile, 'products.csv', 'text/csv', null, true);
}

it('can import products from a valid CSV', function (): void {
    $file = createProductCsvFile([
        ['iPhone 15', 'SKU-IP15', 'Apple', 'iPhone 15', 'Black', 'Excellent', '1'],
        ['Galaxy S24', 'SKU-GS24', 'Samsung', 'Galaxy S24', 'White', 'Very Good', '1'],
        ['Pixel 9', 'SKU-PX9', 'Google', 'Pixel 9', 'Silver', 'Good', '0'],
    ]);

    $response = $this->post('/products/import-csv', [
        'file' => $file,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect(Product::count())->toBe(3);
    expect(Product::where('sku', 'SKU-IP15')->exists())->toBeTrue();
    expect(Product::where('sku', 'SKU-GS24')->exists())->toBeTrue();
    expect(Product::where('sku', 'SKU-PX9')->exists())->toBeTrue();
});

it('auto-creates brands and colors that do not exist', function (): void {
    $file = createProductCsvFile([
        ['Test Phone', 'SKU-TEST', 'NewBrand', 'Model X', 'Magenta', 'Excellent', '1'],
    ]);

    expect(Brand::where('name', 'NewBrand')->exists())->toBeFalse();
    expect(Color::where('name', 'Magenta')->exists())->toBeFalse();

    $response = $this->post('/products/import-csv', [
        'file' => $file,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect(Brand::where('name', 'NewBrand')->exists())->toBeTrue();
    expect(Color::where('name', 'Magenta')->exists())->toBeTrue();
});

it('reuses existing brands and colors', function (): void {
    $brand = Brand::factory()->create(['name' => 'Apple']);
    $color = Color::factory()->create(['name' => 'Black']);

    $file = createProductCsvFile([
        ['iPhone 16', 'SKU-IP16', 'Apple', 'iPhone 16', 'Black', 'Excellent', '1'],
    ]);

    $this->post('/products/import-csv', ['file' => $file]);

    $product = Product::where('sku', 'SKU-IP16')->first();
    expect($product->brand_id)->toBe($brand->id);
    expect($product->color_id)->toBe($color->id);
    expect(Brand::where('name', 'Apple')->count())->toBe(1);
});

it('fails validation when SKU is duplicated in CSV', function (): void {
    $file = createProductCsvFile([
        ['Phone A', 'SKU-DUP', 'Apple', 'Model A', 'Black', 'Excellent', '1'],
        ['Phone B', 'SKU-DUP', 'Apple', 'Model B', 'White', 'Good', '1'],
    ]);

    $response = $this->post('/products/import-csv', ['file' => $file]);

    $response->assertSessionHasErrors();
    expect(Product::count())->toBe(0);
});

it('fails validation when SKU already exists in database', function (): void {
    Brand::factory()->create();
    Color::factory()->create();
    Product::factory()->create(['sku' => 'SKU-EXISTS']);

    $file = createProductCsvFile([
        ['New Phone', 'SKU-EXISTS', 'Apple', 'Model X', 'Black', 'Excellent', '1'],
    ]);

    $response = $this->post('/products/import-csv', ['file' => $file]);

    $response->assertSessionHasErrors();
});

it('fails validation when title is duplicated in CSV', function (): void {
    $file = createProductCsvFile([
        ['Same Title', 'SKU-001', 'Apple', 'Model A', 'Black', 'Excellent', '1'],
        ['Same Title', 'SKU-002', 'Apple', 'Model B', 'White', 'Good', '1'],
    ]);

    $response = $this->post('/products/import-csv', ['file' => $file]);

    $response->assertSessionHasErrors();
    expect(Product::count())->toBe(0);
});

it('fails validation with invalid condition', function (): void {
    $file = createProductCsvFile([
        ['Phone A', 'SKU-001', 'Apple', 'Model A', 'Black', 'InvalidCond', '1'],
    ]);

    $response = $this->post('/products/import-csv', ['file' => $file]);

    $response->assertSessionHasErrors();
});

it('fails validation when required fields are missing', function (): void {
    $file = createProductCsvFile([
        ['', '', '', '', '', '', ''],
    ]);

    $response = $this->post('/products/import-csv', ['file' => $file]);

    $response->assertSessionHasErrors();
});

it('fails validation when no file is provided', function (): void {
    $response = $this->post('/products/import-csv', []);

    $response->assertSessionHasErrors(['file']);
});

it('correctly maps is_active values', function (): void {
    $file = createProductCsvFile([
        ['Active Phone', 'SKU-ACT', 'Apple', 'Model A', 'Black', 'Excellent', '1'],
        ['Inactive Phone', 'SKU-INACT', 'Apple', 'Model B', 'White', 'Good', '0'],
    ]);

    $this->post('/products/import-csv', ['file' => $file]);

    $activeProduct = Product::where('sku', 'SKU-ACT')->first();
    $inactiveProduct = Product::where('sku', 'SKU-INACT')->first();

    expect($activeProduct->is_active->value)->toBe(1);
    expect($inactiveProduct->is_active->value)->toBe(2);
});
