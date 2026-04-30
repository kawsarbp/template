<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\VisibilityStatus;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;

class Customer extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'name',
        'email',
        'phone',
        'company_name',
        'address',
        'country',
        'state',
        'city',
        'status',
        'advance_payment_balance',
    ];

    protected function casts(): array
    {
        return [
            'advance_payment_balance' => 'float',
            'status' => VisibilityStatus::class,
        ];
    }

    public function activity_log(): MorphOne
    {
        return $this->morphOne(Activity::class, 'subject')->latest();
    }

    public function advance_payments(): HasMany
    {
        return $this->hasMany(AdvancedAccount::class, 'customer_id', 'id');
    }

    #[Scope]
    protected function active(Builder $query): Builder
    {
        return $query->where('status', VisibilityStatus::ACTIVE);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->setDescriptionForEvent(function (string $eventName) {
                $viewUrl = url()->route('customers.show', $this->id, false);

                return trans('auth.audit_events.'.$eventName)." <a href='".$viewUrl."' target='_blank'>Customer by ".Auth::user()?->name.'</a>';
            })
            ->logOnly([
                'customer_id',
                'name',
                'email',
                'phone',
                'company_name',
                'address',
                'country',
                'state',
                'city',
                'status',
                'advance_payment_balance',
            ])
            ->dontLogIfAttributesChangedOnly(['updated_at'])
            ->dontSubmitEmptyLogs();
    }

    protected static function boot(): void
    {
        parent::boot();

        Customer::creating(function ($model) {
            if (empty($model->cusotmer_id)) {
                $model->customer_id = (Customer::max('customer_id') ?? 10000) + 1;
            }
        });
    }
}
