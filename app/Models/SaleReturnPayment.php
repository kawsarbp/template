<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\VoucherType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SaleReturnPayment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sale_return_id',
        'amount',
        'payment_date',
        'bank_account_id',
        'voucher_number',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'payment_date' => 'date',
            'amount' => 'float',
        ];
    }

    public function saleReturn(): BelongsTo
    {
        return $this->belongsTo(SaleReturn::class);
    }

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class);
    }

    protected static function boot(): void
    {
        parent::boot();

        SaleReturnPayment::creating(function ($model) {
            $model->voucher_number = generateVoucherNumber(VoucherType::GENERAL_CASH_OUT->value);
        });
    }
}
