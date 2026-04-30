<?php

declare(strict_types=1);

namespace App\Imports;

use App\Actions\Stock\StoreStockPurchaseAction;
use App\Models\Product;
use App\Models\Stock;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class StockPurchaseImport implements ToCollection, WithHeadingRow
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

    public function __construct(
        private readonly string $batchNumber,
        private readonly int $supplierId,
        private readonly string $purchaseDate,
        private readonly float $discount = 0,
        private readonly ?string $notes = null,
    ) {}

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

        $items = $this->buildItems($rows);

        app(StoreStockPurchaseAction::class)->execute([
            'batch_number' => $this->batchNumber,
            'supplier_id' => $this->supplierId,
            'purchase_date' => $this->purchaseDate,
            'discount' => $this->discount,
            'notes' => $this->notes,
            'items' => $items,
        ]);
    }

    private function validateRows(Collection $rows): void
    {
        $csvImeis = [];

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 3; // +3 for sep= row, heading row, and 0-index

            $sku = trim((string) ($row['sku'] ?? ''));
            $unitPrice = $row['unit_price'] ?? '';
            $salePrice = $row['sale_price'] ?? '';
            $condition = trim((string) ($row['condition'] ?? ''));
            $imei = trim((string) ($row['imei'] ?? ''));

            if ($sku === '') {
                $this->errors["row_{$rowNumber}_sku"] = __('Row :row: SKU is required.', ['row' => $rowNumber]);
            } elseif (! Product::where('sku', $sku)->exists()) {
                $this->errors["row_{$rowNumber}_sku"] = __("Row :row: SKU ':sku' does not exist.", ['row' => $rowNumber, 'sku' => $sku]);
            }

            if ($unitPrice === '' || $unitPrice === null) {
                $this->errors["row_{$rowNumber}_unit_price"] = __('Row :row: Unit price is required.', ['row' => $rowNumber]);
            } elseif (! is_numeric($unitPrice) || (float) $unitPrice < 0) {
                $this->errors["row_{$rowNumber}_unit_price"] = __('Row :row: Unit price must be a valid positive number.', ['row' => $rowNumber]);
            }

            if ($salePrice !== '' && $salePrice !== null && (! is_numeric($salePrice) || (float) $salePrice < 0)) {
                $this->errors["row_{$rowNumber}_sale_price"] = __('Row :row: Sale price must be a valid positive number.', ['row' => $rowNumber]);
            }

            if ($condition === '') {
                $this->errors["row_{$rowNumber}_condition"] = __('Row :row: Condition is required.', ['row' => $rowNumber]);
            } elseif (! isset(self::$conditionMap[strtolower($condition)])) {
                $this->errors["row_{$rowNumber}_condition"] = __("Row :row: Invalid condition ':condition'. Must be one of: Excellent, Very Good, Good, Fair, Poor.", ['row' => $rowNumber, 'condition' => $condition]);
            }

            if ($imei === '') {
                $this->errors["row_{$rowNumber}_imei"] = __('Row :row: IMEI is required.', ['row' => $rowNumber]);
            } else {
                if (in_array($imei, $csvImeis, true)) {
                    $this->errors["row_{$rowNumber}_imei"] = __("Row :row: Duplicate IMEI ':imei' in CSV.", ['row' => $rowNumber, 'imei' => $imei]);
                } elseif (Stock::where('imei', $imei)->exists()) {
                    $this->errors["row_{$rowNumber}_imei"] = __("Row :row: IMEI ':imei' already exists in the system.", ['row' => $rowNumber, 'imei' => $imei]);
                }

                $csvImeis[] = $imei;
            }
        }
    }

    /**
     * @return array<int, array{product_id: int, quantity: int, unit_price: float, sale_price: float|null, condition: int, imeis: array<string>}>
     */
    private function buildItems(Collection $rows): array
    {
        $groups = [];

        foreach ($rows as $row) {
            $sku = trim((string) $row['sku']);
            $unitPrice = (float) $row['unit_price'];
            $salePrice = ($row['sale_price'] !== '' && $row['sale_price'] !== null) ? (float) $row['sale_price'] : null;
            $conditionId = self::$conditionMap[strtolower(trim((string) $row['condition']))];
            $imei = trim((string) $row['imei']);

            $groupKey = "{$sku}|{$unitPrice}|{$salePrice}|{$conditionId}";

            if (! isset($groups[$groupKey])) {
                $product = Product::where('sku', $sku)->first();
                $groups[$groupKey] = [
                    'product_id' => $product->id,
                    'unit_price' => $unitPrice,
                    'sale_price' => $salePrice,
                    'condition_id' => $conditionId,
                    'imeis' => [],
                ];
            }

            $groups[$groupKey]['imeis'][] = $imei;
        }

        return array_map(function (array $group) {
            $group['quantity'] = count($group['imeis']);

            return $group;
        }, array_values($groups));
    }
}
