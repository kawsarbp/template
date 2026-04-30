<?php

namespace App\Models;

use App\Enums\CashflowType;
use App\Enums\VoucherType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class CashflowTransaction extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'type',
        'name',
        'bank_account_id',
        'date',
        'amount',
        'description',
        'signature_url',
        'voucher_number',
        'created_by',
        'attachment',
    ];

    protected $casts = [
        'amount' => 'float',
        'attachment' => 'array',
        'type' => CashflowType::class,
    ];

    public function bank_account(): HasOne
    {
        return $this->hasOne(BankAccount::class, 'id', 'bank_account_id');
    }

    public function scopeWithoutNonCash(Builder $query): void
    {
        $query->whereNot('bank_account_id', '=', BankAccount::NON_CASH_ID);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->setDescriptionForEvent(function (string $eventName) {
                $viewUrl = url()->route('cashflow-transactions.index', 'id='.$this->id, false);

                return config(
                    'app.audit_events.'.$eventName
                )." <a href='".$viewUrl."' target='_blank'>Cashflow Transaction by ".Auth::user()?->name.'</a>';
            })
            ->logOnly([
                'type',
                'name',
                'bank_account.holder_name',
                'date',
                'amount',
                'description',
                'signature_url',
                'voucher_number',
                'attachment',
            ])
            ->dontLogIfAttributesChangedOnly(['updated_at'])
            ->dontSubmitEmptyLogs();
    }

    protected static function boot(): void
    {
        parent::boot();

        CashflowTransaction::creating(function ($model) {
            $model->voucher_number = generateVoucherNumber($model->type == CashflowType::CASH_IN ? VoucherType::GENERAL_CASH_IN->value : VoucherType::GENERAL_CASH_OUT->value);
        });
    }
}
