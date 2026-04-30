<?php

declare(strict_types=1);

namespace App\Imports;

use App\Actions\Sale\StoreSaleAction;
use App\Enums\StockStatus;
use App\Models\Stock;
use App\Models\StockPurchase;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class SaleImport implements ToCollection, WithHeadingRow
{
    /** @var array<string, string> */
    private array $errors = [];

    public function __construct(
        private readonly ?int $customerId,
        private readonly int $saleType,
        private readonly string $saleDate,
        private readonly float $discount = 0,
        private readonly float $payment = 0,
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

        $totalAmount = array_sum(array_column($items, 'sale_price'));
        $grandTotal = $totalAmount - $this->discount;

        if ($this->payment > $grandTotal) {
            throw ValidationException::withMessages([
                'payment' => __('Payment cannot exceed the grand total.'),
            ]);
        }

        app(StoreSaleAction::class)->execute([
            'customer_id' => $this->customerId,
            'sale_type' => $this->saleType,
            'sale_date' => $this->saleDate,
            'discount' => $this->discount,
            'payment' => $this->payment,
            'notes' => $this->notes,
            'items' => $items,
        ]);
    }

    private function validateRows(Collection $rows): void
    {
        $csvImeis = [];

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 3; // +3 for sep= row, heading row, and 0-index

            $type = strtolower(trim((string) ($row['type'] ?? '')));
            $identifier = trim((string) ($row['identifier'] ?? ''));
            $salePrice = $row['sale_price'] ?? '';
            $quantity = $row['quantity'] ?? '';

            if (! in_array($type, ['imei', 'glot'], true)) {
                $this->errors["row_{$rowNumber}_type"] = __('Row :row: Type must be either "imei" or "glot".', ['row' => $rowNumber]);
            }

            if ($identifier === '') {
                $this->errors["row_{$rowNumber}_identifier"] = __('Row :row: Identifier is required.', ['row' => $rowNumber]);
            } elseif ($type === 'imei') {
                if (in_array($identifier, $csvImeis, true)) {
                    $this->errors["row_{$rowNumber}_identifier"] = __('Row :row: Duplicate IMEI ":identifier" in CSV.', ['row' => $rowNumber, 'identifier' => $identifier]);
                } else {
                    $stock = Stock::where('imei', $identifier)->first();
                    if (! $stock) {
                        $this->errors["row_{$rowNumber}_identifier"] = __('Row :row: IMEI ":identifier" does not exist in the system.', ['row' => $rowNumber, 'identifier' => $identifier]);
                    } elseif ($stock->status !== StockStatus::AVAILABLE) {
                        $this->errors["row_{$rowNumber}_identifier"] = __('Row :row: IMEI ":identifier" is not available for sale.', ['row' => $rowNumber, 'identifier' => $identifier]);
                    }
                    $csvImeis[] = $identifier;
                }
            } elseif ($type === 'glot') {
                $stockPurchase = StockPurchase::where('batch_number', $identifier)->first();
                if (! $stockPurchase) {
                    $this->errors["row_{$rowNumber}_identifier"] = __('Row :row: GLOT ":identifier" does not exist in the system.', ['row' => $rowNumber, 'identifier' => $identifier]);
                } else {
                    $availableCount = $stockPurchase->stocks()->where('status', StockStatus::AVAILABLE)->count();
                    if ($availableCount === 0) {
                        $this->errors["row_{$rowNumber}_identifier"] = __('Row :row: GLOT ":identifier" has no available stock.', ['row' => $rowNumber, 'identifier' => $identifier]);
                    }
                }
            }

            if ($salePrice === '' || $salePrice === null) {
                $this->errors["row_{$rowNumber}_sale_price"] = __('Row :row: Sale price is required.', ['row' => $rowNumber]);
            } elseif (! is_numeric($salePrice) || (float) $salePrice < 0) {
                $this->errors["row_{$rowNumber}_sale_price"] = __('Row :row: Sale price must be a valid positive number.', ['row' => $rowNumber]);
            }

            if ($quantity === '' || $quantity === null) {
                $this->errors["row_{$rowNumber}_quantity"] = __('Row :row: Quantity is required.', ['row' => $rowNumber]);
            } elseif (! is_numeric($quantity) || (int) $quantity < 1) {
                $this->errors["row_{$rowNumber}_quantity"] = __('Row :row: Quantity must be a positive integer.', ['row' => $rowNumber]);
            } elseif ($type === 'imei' && (int) $quantity !== 1) {
                $this->errors["row_{$rowNumber}_quantity"] = __('Row :row: Quantity for IMEI items must be 1.', ['row' => $rowNumber]);
            } elseif ($type === 'glot' && $identifier !== '') {
                $stockPurchase = StockPurchase::where('batch_number', $identifier)->first();
                if ($stockPurchase) {
                    $availableCount = $stockPurchase->stocks()->where('status', StockStatus::AVAILABLE)->count();
                    if ($availableCount > 0 && (int) $quantity !== $availableCount) {
                        $this->errors["row_{$rowNumber}_quantity"] = __('Row :row: Quantity for GLOT must match all available stock (:count units).', ['row' => $rowNumber, 'count' => $availableCount]);
                    }
                }
            }
        }
    }

    /**
     * @return array<int, array{stock_id: int, sale_price: float, source_type: string, line_number: int, stock_purchase_id: int|null}>
     */
    private function buildItems(Collection $rows): array
    {
        $items = [];
        $lineNumber = 1;

        foreach ($rows as $row) {
            $type = strtolower(trim((string) $row['type']));
            $identifier = trim((string) $row['identifier']);
            $salePrice = (float) $row['sale_price'];

            if ($type === 'imei') {
                $stock = Stock::where('imei', $identifier)->first();
                $items[] = [
                    'stock_id' => $stock->id,
                    'sale_price' => $salePrice,
                    'source_type' => 'stock',
                    'line_number' => $lineNumber,
                    'stock_purchase_id' => null,
                ];
            } elseif ($type === 'glot') {
                $stockPurchase = StockPurchase::where('batch_number', $identifier)->first();
                $availableStocks = $stockPurchase->stocks()->where('status', StockStatus::AVAILABLE)->get();

                foreach ($availableStocks as $stock) {
                    $items[] = [
                        'stock_id' => $stock->id,
                        'sale_price' => $salePrice,
                        'source_type' => 'glot',
                        'line_number' => $lineNumber,
                        'stock_purchase_id' => $stockPurchase->id,
                    ];
                }
            }

            $lineNumber++;
        }

        return $items;
    }
}
