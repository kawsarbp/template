<?php

declare(strict_types=1);

namespace App\Actions\SaleReturn;

use App\Enums\StockStatus;
use App\Models\BankAccount;
use App\Models\SaleReturn;
use App\Models\SaleReturnItem;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;

class StoreSaleReturnAction
{
    /**
     * @return array{saleReturn: SaleReturn, payment_id: int|null}
     */
    public function execute(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $totalUnits = count($data['items']);
            $totalAmount = 0;

            foreach ($data['items'] as $item) {
                $totalAmount += (float) $item['return_price'];
            }

            $discount = (float) ($data['discount'] ?? 0);
            $totalDue = $totalAmount - $discount;

            $saleReturn = SaleReturn::create([
                'customer_id' => $data['customer_id'] ?? null,
                'return_date' => $data['return_date'],
                'notes' => $data['notes'] ?? null,
                'total_units' => $totalUnits,
                'total_amount' => $totalAmount,
                'discount' => $discount,
                'total_due' => $totalDue,
            ]);

            foreach ($data['items'] as $itemData) {
                SaleReturnItem::create([
                    'sale_return_id' => $saleReturn->id,
                    'stock_id' => $itemData['stock_id'],
                    'return_price' => $itemData['return_price'],
                    'source_type' => $itemData['source_type'] ?? 'stock',
                    'line_number' => $itemData['line_number'] ?? 1,
                    'stock_purchase_id' => $itemData['stock_purchase_id'] ?? null,
                ]);

                Stock::where('id', $itemData['stock_id'])
                    ->update(['status' => StockStatus::AVAILABLE]);
            }

            $paymentAmount = (float) ($data['payment'] ?? 0);
            $paymentId = null;
            if ($paymentAmount > 0) {
                $payment = $saleReturn->payments()->create([
                    'amount' => $paymentAmount,
                    'payment_date' => $data['return_date'],
                    'bank_account_id' => BankAccount::CASH,
                    'notes' => null,
                ]);
                $paymentId = $payment->id;
                $saleReturn->recalculatePaymentStatus();
            }

            return [
                'saleReturn' => $saleReturn->load(['items.stock.product.brand', 'customer']),
                'payment_id' => $paymentId,
            ];
        });
    }
}
