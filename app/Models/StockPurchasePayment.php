<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\VoucherType;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class StockPurchasePayment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'stock_purchase_id',
        'amount',
        'payment_date',
        'bank_account_id',
        'notes',
        'voucher_number',
        'attachment',
        'paid_to',
        'group_payment_ids',
        'is_bulk_payment',
        'supplier_id',
        'currency',
        'parent_id',
    ];

    protected function casts(): array
    {
        return [
            'payment_date' => 'date',
            'attachment' => 'array',
            'group_payment_ids' => 'array',
            'amount' => 'float',
            'is_bulk_payment' => 'boolean',
        ];
    }

    public function stockPurchase(): BelongsTo
    {
        return $this->belongsTo(StockPurchase::class);
    }

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(StockPurchasePayment::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(StockPurchasePayment::class, 'parent_id');
    }

    #[Scope]
    public function withoutNonCash(Builder $query): void
    {
        $query->whereNot('bank_account_id', '=', BankAccount::NON_CASH_ID);
    }

    protected static function boot(): void
    {
        parent::boot();

        StockPurchasePayment::creating(function ($model) {
            if (empty($model->voucher_number)) {
                $model->voucher_number = generateVoucherNumber(VoucherType::GENERAL_CASH_OUT->value);
            }
        });
    }
}
