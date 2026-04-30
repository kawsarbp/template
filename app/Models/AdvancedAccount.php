<?php

namespace App\Models;

use App\Enums\AdvanceAccountType;
use App\Enums\VoucherType;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class AdvancedAccount extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'voucher_number',
        'date',
        'amount',
        'note',
        'attachment',
        'used_amount',
        'bank_account_id',
        'created_by',
        'deleted_by',
        'type',
    ];

    protected $casts = [
        'attachment' => 'array',
        'amount' => 'float',
        'type' => AdvanceAccountType::class,
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function bank_account(): HasOne
    {
        return $this->hasOne(BankAccount::class, 'id', 'bank_account_id');
    }

    #[Scope]
    public function withoutNonCash(Builder $query): void
    {
        $query->whereNot('bank_account_id', '=', BankAccount::NON_CASH_ID);
    }

    protected static function boot(): void
    {
        parent::boot();

        AdvancedAccount::creating(function ($model) {
            $model->voucher_number = generateVoucherNumber($model->type == AdvanceAccountType::DEPOSIT ? VoucherType::GENERAL_CASH_IN->value : VoucherType::GENERAL_CASH_OUT->value);
        });
    }
}
