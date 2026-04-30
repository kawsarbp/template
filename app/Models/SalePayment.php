<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\VoucherType;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalePayment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sale_id',
        'amount',
        'payment_date',
        'bank_account_id',
        'notes',
        'voucher_number',
        'received_from',
        'attachment',
        'group_payment_ids',
    ];

    protected function casts(): array
    {
        return [
            'payment_date' => 'date',
            'group_payment_ids' => 'array',
            'amount' => 'float',
            'attachment' => 'array',
        ];
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class);
    }

    #[Scope]
    public function withoutNonCash(Builder $query): void
    {
        $query->whereNot('bank_account_id', '=', BankAccount::NON_CASH_ID);
    }

    protected static function boot(): void
    {
        parent::boot();

        SalePayment::creating(function ($model) {
            $model->voucher_number = generateVoucherNumber(VoucherType::GENERAL_CASH_IN->value);
        });
    }
}
