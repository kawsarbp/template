<?php

declare(strict_types=1);

namespace App\Actions\Sale;

use App\Enums\StockStatus;
use App\Models\BankAccount;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;

class StoreSaleAction
{
    /**
     * @return array{sale: Sale, payment_id: int|null}
     */
    public function execute(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $totalUnits = count($data['items']);
            $totalAmount = 0;

            foreach ($data['items'] as $item) {
                $totalAmount += (float) $item['sale_price'];
            }

            $discount = (float) ($data['discount'] ?? 0);
            $totalDue = $totalAmount - $discount;

            $sale = Sale::create([
                'customer_id' => $data['customer_id'] ?? null,
                'sale_type' => $data['sale_type'],
                'sale_date' => $data['sale_date'],
                'notes' => $data['notes'] ?? null,
                'total_units' => $totalUnits,
                'total_amount' => $totalAmount,
                'discount' => $discount,
                'total_due' => $totalDue,
            ]);

            foreach ($data['items'] as $itemData) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'stock_id' => $itemData['stock_id'],
                    'sale_price' => $itemData['sale_price'],
                    'source_type' => $itemData['source_type'] ?? 'stock',
                    'line_number' => $itemData['line_number'] ?? 1,
                    'stock_purchase_id' => $itemData['stock_purchase_id'] ?? null,
                ]);

                Stock::where('id', $itemData['stock_id'])
                    ->update(['status' => StockStatus::SOLD]);
            }

            $paymentAmount = (float) ($data['payment'] ?? 0);
            $paymentId = null;
            if ($paymentAmount > 0) {
                $payment = $sale->payments()->create([
                    'amount' => $paymentAmount,
                    'payment_date' => $data['sale_date'],
                    'bank_account_id' => BankAccount::CASH,
                    'notes' => $sale->notes,
                ]);
                $paymentId = $payment->id;
                $sale->recalculatePaymentStatus();
            }

            return [
                'sale' => $sale->load(['items.stock.product.brand', 'customer']),
                'payment_id' => $paymentId,
            ];
        });
    }
}
