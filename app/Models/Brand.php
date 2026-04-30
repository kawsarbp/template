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

class Brand extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'name',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => VisibilityStatus::class,
        ];
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
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
                $viewUrl = url()->route('brands.index', 'id='.$this->id, false);

                return trans('auth.audit_events.'.$eventName)." <a href='".$viewUrl."' target='_blank'>Brand by ".Auth::user()?->name.'</a>';
            })
            ->logOnly([
                'name',
                'status',
            ])
            ->dontLogIfAttributesChangedOnly(['updated_at'])
            ->dontSubmitEmptyLogs();
    }
}
