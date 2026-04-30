<?php

declare(strict_types=1);

namespace App\Imports;

use App\Actions\Product\StoreProductAction;
use App\Enums\VisibilityStatus;
use App\Models\Brand;
use App\Models\Color;
use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ProductImport implements ToCollection, WithHeadingRow
{
    /** @var array<string, string> */
    private array $errors = [];

    /** @var array<string, int> */
    private static array $conditionMap = [
        'excellent' => 1,
        'very good' => 2,
        'good' => 3,
        'fair' => 4,
        'poor' => 5,
    ];

    /**
     * @throws ValidationException
     */
    public function collection(Collection $rows): void
    {
        if ($rows->isEmpty()) {
            throw ValidationException::withMessages([
                'file' => __('The CSV file is empty or has no valid data rows.'),
            ]);
        }

        $this->validateRows($rows);

        if (! empty($this->errors)) {
            throw ValidationException::withMessages($this->errors);
        }

        $storeAction = app(StoreProductAction::class);

        foreach ($rows as $row) {
            $brand = Brand::firstOrCreate(
                ['name' => trim((string) $row['brand'])],
                ['status' => VisibilityStatus::ACTIVE->value],
            );

            $color = Color::firstOrCreate(
                ['name' => trim((string) $row['color'])],
                ['status' => VisibilityStatus::ACTIVE->value],
            );

            $isActive = ((int) $row['is_active'] === 1) ? 1 : 2;

            $storeAction->execute([
                'title' => trim((string) $row['title']),
                'sku' => trim((string) $row['sku']),
                'brand_id' => $brand->id,
                'model' => trim((string) $row['model']),
                'color_id' => $color->id,
                'condition' => self::$conditionMap[strtolower(trim((string) $row['condition']))],
                'is_active' => $isActive,
            ]);
        }
    }

    private function validateRows(Collection $rows): void
    {
        $csvTitles = [];
        $csvSkus = [];

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 3; // +3 for sep= row, heading row, and 0-index

            $title = trim((string) ($row['title'] ?? ''));
            $sku = trim((string) ($row['sku'] ?? ''));
            $brand = trim((string) ($row['brand'] ?? ''));
            $model = trim((string) ($row['model'] ?? ''));
            $color = trim((string) ($row['color'] ?? ''));
            $condition = trim((string) ($row['condition'] ?? ''));
            $isActive = $row['is_active'] ?? '';

            if ($title === '') {
                $this->errors["row_{$rowNumber}_title"] = __('Row :row: Title is required.', ['row' => $rowNumber]);
            } else {
                if (in_array(strtolower($title), $csvTitles, true)) {
                    $this->errors["row_{$rowNumber}_title"] = __("Row :row: Duplicate title ':title' in CSV.", ['row' => $rowNumber, 'title' => $title]);
                } elseif (Product::where('title', $title)->whereNull('deleted_at')->exists()) {
                    $this->errors["row_{$rowNumber}_title"] = __("Row :row: Title ':title' already exists.", ['row' => $rowNumber, 'title' => $title]);
                }

                $csvTitles[] = strtolower($title);
            }

            if ($sku === '') {
                $this->errors["row_{$rowNumber}_sku"] = __('Row :row: SKU is required.', ['row' => $rowNumber]);
            } else {
                if (in_array(strtolower($sku), $csvSkus, true)) {
                    $this->errors["row_{$rowNumber}_sku"] = __("Row :row: Duplicate SKU ':sku' in CSV.", ['row' => $rowNumber, 'sku' => $sku]);
                } elseif (Product::where('sku', $sku)->whereNull('deleted_at')->exists()) {
                    $this->errors["row_{$rowNumber}_sku"] = __("Row :row: SKU ':sku' already exists.", ['row' => $rowNumber, 'sku' => $sku]);
                }

                $csvSkus[] = strtolower($sku);
            }

            if ($brand === '') {
                $this->errors["row_{$rowNumber}_brand"] = __('Row :row: Brand is required.', ['row' => $rowNumber]);
            }

            if ($model === '') {
                $this->errors["row_{$rowNumber}_model"] = __('Row :row: Model is required.', ['row' => $rowNumber]);
            }

            if ($color === '') {
                $this->errors["row_{$rowNumber}_color"] = __('Row :row: Color is required.', ['row' => $rowNumber]);
            }

            if ($condition === '') {
                $this->errors["row_{$rowNumber}_condition"] = __('Row :row: Condition is required.', ['row' => $rowNumber]);
            } elseif (! isset(self::$conditionMap[strtolower($condition)])) {
                $this->errors["row_{$rowNumber}_condition"] = __("Row :row: Invalid condition ':condition'. Must be one of: Excellent, Very Good, Good, Fair, Poor.", ['row' => $rowNumber, 'condition' => $condition]);
            }

            if ($isActive === '' || $isActive === null) {
                $this->errors["row_{$rowNumber}_is_active"] = __('Row :row: Is Active is required.', ['row' => $rowNumber]);
            } elseif (! in_array((string) $isActive, ['0', '1'], true)) {
                $this->errors["row_{$rowNumber}_is_active"] = __('Row :row: Is Active must be 0 or 1.', ['row' => $rowNumber]);
            }
        }
    }
}
