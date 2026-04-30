<?php

declare(strict_types=1);

use App\Enums\StockStatus;
use App\Models\Stock;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

function makeImeiReplaceCsv(array $rows): UploadedFile
{
    $content = "sep=,\nold_imei,new_imei\n";
    foreach ($rows as $row) {
        $content .= implode(',', $row)."\n";
    }

    $tempFile = tempnam(sys_get_temp_dir(), 'imei_csv_');
    file_put_contents($tempFile, $content);

    return new UploadedFile($tempFile, 'imei-replace.csv', 'text/csv', null, true);
}

it('replaces imei numbers from a valid csv', function (): void {
    $stock1 = Stock::factory()->create(['imei' => '111111111111111', 'status' => StockStatus::AVAILABLE]);
    $stock2 = Stock::factory()->create(['imei' => '222222222222222', 'status' => StockStatus::AVAILABLE]);

    $file = makeImeiReplaceCsv([
        ['111111111111111', '999999999999991'],
        ['222222222222222', '999999999999992'],
    ]);

    $response = $this->post('/stocks/import-imei-replace', ['file' => $file]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect(Stock::where('imei', '999999999999991')->exists())->toBeTrue();
    expect(Stock::where('imei', '999999999999992')->exists())->toBeTrue();
    expect(Stock::where('imei', '111111111111111')->exists())->toBeFalse();
    expect(Stock::where('imei', '222222222222222')->exists())->toBeFalse();
});

it('rejects import when old imei does not exist', function (): void {
    $file = makeImeiReplaceCsv([
        ['nonexistent000000', '999999999999991'],
    ]);

    $response = $this->post('/stocks/import-imei-replace', ['file' => $file]);

    $response->assertRedirect();
    $response->assertSessionHasErrors(['row_3_old_imei']);
});

it('rejects import when old imei is not available', function (): void {
    Stock::factory()->create(['imei' => '111111111111111', 'status' => StockStatus::SOLD]);

    $file = makeImeiReplaceCsv([
        ['111111111111111', '999999999999991'],
    ]);

    $response = $this->post('/stocks/import-imei-replace', ['file' => $file]);

    $response->assertRedirect();
    $response->assertSessionHasErrors(['row_3_old_imei']);
});

it('rejects import when new imei already exists in the system', function (): void {
    Stock::factory()->create(['imei' => '111111111111111', 'status' => StockStatus::AVAILABLE]);
    Stock::factory()->create(['imei' => '999999999999991', 'status' => StockStatus::AVAILABLE]);

    $file = makeImeiReplaceCsv([
        ['111111111111111', '999999999999991'],
    ]);

    $response = $this->post('/stocks/import-imei-replace', ['file' => $file]);

    $response->assertRedirect();
    $response->assertSessionHasErrors(['row_3_new_imei']);
});

it('rejects import when new imei is duplicated in the csv', function (): void {
    Stock::factory()->create(['imei' => '111111111111111', 'status' => StockStatus::AVAILABLE]);
    Stock::factory()->create(['imei' => '222222222222222', 'status' => StockStatus::AVAILABLE]);

    $file = makeImeiReplaceCsv([
        ['111111111111111', '999999999999991'],
        ['222222222222222', '999999999999991'],
    ]);

    $response = $this->post('/stocks/import-imei-replace', ['file' => $file]);

    $response->assertRedirect();
    $response->assertSessionHasErrors(['row_4_new_imei']);
});

it('rejects import when file is empty', function (): void {
    $tempFile = tempnam(sys_get_temp_dir(), 'empty_csv_');
    file_put_contents($tempFile, "sep=,\nold_imei,new_imei\n");
    $file = new UploadedFile($tempFile, 'empty.csv', 'text/csv', null, true);

    $response = $this->post('/stocks/import-imei-replace', ['file' => $file]);

    $response->assertRedirect();
    $response->assertSessionHasErrors(['file']);
});

it('requires a file to be uploaded', function (): void {
    $response = $this->post('/stocks/import-imei-replace', []);

    $response->assertRedirect();
    $response->assertSessionHasErrors(['file']);
});
