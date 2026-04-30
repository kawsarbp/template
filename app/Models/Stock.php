<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\StockStatus;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;

class Stock extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'stock_purchase_item_id',
        'product_id',
        'imei',
        'condition_id',
        'purchase_price',
        'sale_price',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'status' => StockStatus::class,
        ];
    }

    public function stockPurchaseItem(): BelongsTo
    {
        return $this->belongsTo(StockPurchaseItem::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function condition(): BelongsTo
    {
        return $this->belongsTo(Condition::class, 'condition_id');
    }

    public function activity_log(): MorphOne
    {
        return $this->morphOne(Activity::class, 'subject')->latest();
    }

    #[Scope]
    protected function available(Builder $query): Builder
    {
        return $query->where('status', StockStatus::AVAILABLE);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->setDescriptionForEvent(function (string $eventName) {
                return trans('auth.audit_events.'.$eventName).' Stock by '.Auth::user()?->name;
            })
            ->logOnly([
                'imei',
                'condition_id',
                'purchase_price',
                'sale_price',
                'status',
                'notes',
            ])
            ->dontLogIfAttributesChangedOnly(['updated_at'])
            ->dontSubmitEmptyLogs();
    }
}
