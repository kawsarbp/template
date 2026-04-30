<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\BooleanStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;

class Product extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'sku',
        'description',
        'brand_id',
        'model',
        'color_id',
        'storage_capacity',
        'ram',
        'condition_id',
        'operating_system',
        'photos',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'photos' => 'array',
            'is_active' => BooleanStatus::class,
        ];
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function color(): BelongsTo
    {
        return $this->belongsTo(Color::class);
    }

    public function condition(): BelongsTo
    {
        return $this->belongsTo(Condition::class, 'condition_id');
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class);
    }

    public function stockPurchaseItems(): HasMany
    {
        return $this->hasMany(StockPurchaseItem::class);
    }

    public function activity_log(): MorphOne
    {
        return $this->morphOne(Activity::class, 'subject')->latest();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->setDescriptionForEvent(function (string $eventName) {
                $viewUrl = url()->route('products.show', $this->id, false);

                return trans('auth.audit_events.'.$eventName)." <a href='".$viewUrl."' target='_blank'>Product by ".Auth::user()?->name.'</a>';
            })
            ->logOnly([
                'title',
                'sku',
                'description',
                'brand_id',
                'model',
                'color',
                'storage_capacity',
                'ram',
                'condition',
                'operating_system',
                'photos',
                'is_active',
            ])
            ->dontLogIfAttributesChangedOnly(['updated_at'])
            ->dontSubmitEmptyLogs();
    }
}
