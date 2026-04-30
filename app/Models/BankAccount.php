<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class BankAccount extends Model
{
    use HasFactory, LogsActivity;

    public const CASH = 1;

    public const NON_CASH_ID = 2;

    protected $fillable = [
        'holder_name',
        'name',
        'account_number',
        'opening_balance',
        'bank_address',
        'created_by',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    #[Scope]
    protected function withoutNonCash(Builder $query): Builder
    {
        return $query->whereNot('id', '=', self::NON_CASH_ID);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->setDescriptionForEvent(function (string $eventName) {
                $viewUrl = url()->route('bank-accounts.index', 'id='.$this->id, false);

                return trans('auth.audit_events.'.$eventName)." <a href='".$viewUrl."' target='_blank'>BankAccount by ".Auth::user()?->name.'</a>';
            })
            ->logOnly([
                'creator.name',
                'holder_name',
                'name',
                'account_number',
                'opening_balance',
                'status',
            ])
            ->dontLogIfAttributesChangedOnly(['updated_at'])
            ->dontSubmitEmptyLogs();
    }
}
