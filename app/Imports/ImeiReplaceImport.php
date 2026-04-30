<?php

declare(strict_types=1);

namespace App\Imports;

use App\Enums\StockStatus;
use App\Models\Stock;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ImeiReplaceImport implements ToCollection, WithHeadingRow
{
    /** @var array<string, string> */
    private array $errors = [];

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

        $this->replaceImeis($rows);
    }

    private function validateRows(Collection $rows): void
    {
        $csvNewImeis = [];

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 3; // +3 for sep= row, heading row, and 0-index

            $oldImei = trim((string) ($row['old_imei'] ?? ''));
            $newImei = trim((string) ($row['new_imei'] ?? ''));

            if ($oldImei === '') {
                $this->errors["row_{$rowNumber}_old_imei"] = __('Row :row: Old IMEI is required.', ['row' => $rowNumber]);
            } else {
                $stock = Stock::where('imei', $oldImei)->first();

                if (! $stock) {
                    $this->errors["row_{$rowNumber}_old_imei"] = __('Row :row: Old IMEI ":imei" does not exist in the system.', ['row' => $rowNumber, 'imei' => $oldImei]);
                } elseif ($stock->status !== StockStatus::AVAILABLE) {
                    $this->errors["row_{$rowNumber}_old_imei"] = __('Row :row: Old IMEI ":imei" is not in available status.', ['row' => $rowNumber, 'imei' => $oldImei]);
                }
            }

            if ($newImei === '') {
                $this->errors["row_{$rowNumber}_new_imei"] = __('Row :row: New IMEI is required.', ['row' => $rowNumber]);
            } else {
                if (in_array($newImei, $csvNewImeis, true)) {
                    $this->errors["row_{$rowNumber}_new_imei"] = __('Row :row: New IMEI ":imei" is duplicated in the CSV.', ['row' => $rowNumber, 'imei' => $newImei]);
                } elseif (Stock::where('imei', $newImei)->exists()) {
                    $this->errors["row_{$rowNumber}_new_imei"] = __('Row :row: New IMEI ":imei" already exists in the system.', ['row' => $rowNumber, 'imei' => $newImei]);
                } else {
                    $csvNewImeis[] = $newImei;
                }
            }
        }
    }

    private function replaceImeis(Collection $rows): void
    {
        foreach ($rows as $row) {
            $oldImei = trim((string) $row['old_imei']);
            $newImei = trim((string) $row['new_imei']);

            Stock::where('imei', $oldImei)->update(['imei' => $newImei]);
        }
    }
}
