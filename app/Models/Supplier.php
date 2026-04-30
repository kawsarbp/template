<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\Currency;
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

class Supplier extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'supplier_id',
        'name',
        'email',
        'phone',
        'company_name',
        'address',
        'currency',
        'balance',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => VisibilityStatus::class,
            'currency' => Currency::class,
        ];
    }

    public function stockPurchases(): HasMany
    {
        return $this->hasMany(StockPurchase::class);
    }

    public function activity_log(): MorphOne
    {
        return $this->morphOne(Activity::class, 'subject')->latest();
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
                $viewUrl = url()->route('suppliers.show', $this->id, false);

                return trans('auth.audit_events.'.$eventName)." <a href='".$viewUrl."' target='_blank'>Supplier by ".Auth::user()?->name.'</a>';
            })
            ->logOnly([
                'supplier_id',
                'name',
                'email',
                'phone',
                'company_name',
                'address',
                'currency',
                'balance',
                'status',
            ])
            ->dontLogIfAttributesChangedOnly(['updated_at'])
            ->dontSubmitEmptyLogs();
    }

    protected static function boot(): void
    {
        parent::boot();

        Supplier::creating(function ($model) {
            if (empty($model->supplier_id)) {
                $model->supplier_id = (Supplier::max('supplier_id') ?? 10000) + 1;
            }
        });
    }
}
