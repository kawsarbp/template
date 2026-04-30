<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PaymentStatus;
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

class SaleReturn extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'return_number',
        'customer_id',
        'return_date',
        'total_units',
        'total_amount',
        'discount',
        'total_refunded',
        'total_due',
        'payment_status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'payment_status' => PaymentStatus::class,
            'return_date' => 'date',
            'total_amount' => 'float',
            'total_refunded' => 'float',
            'total_due' => 'float',
            'discount' => 'float',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleReturnItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(SaleReturnPayment::class);
    }

    public function recalculatePaymentStatus(): void
    {
        $totalRefunded = $this->payments()->sum('amount');
        $totalDue = $this->total_amount - $this->discount - $totalRefunded;

        if ($totalDue <= 0) {
            $paymentStatus = PaymentStatus::PAID;
            $totalDue = 0;
        } elseif ($totalRefunded > 0) {
            $paymentStatus = PaymentStatus::PARTIAL;
        } else {
            $paymentStatus = PaymentStatus::UNPAID;
        }

        $this->update([
            'total_refunded' => $totalRefunded,
            'total_due' => $totalDue,
            'payment_status' => $paymentStatus,
        ]);
    }

    public function activity_log(): MorphOne
    {
        return $this->morphOne(Activity::class, 'subject')->latest();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->setDescriptionForEvent(function (string $eventName) {
                $viewUrl = url()->route('sale-returns.show', $this->id, false);

                return trans('auth.audit_events.'.$eventName)." <a href='".$viewUrl."' target='_blank'>Sale Return by ".Auth::user()?->name.'</a>';
            })
            ->logOnly([
                'return_number',
                'customer_id',
                'total_units',
                'total_amount',
                'discount',
                'total_refunded',
                'total_due',
                'payment_status',
                'return_date',
                'notes',
            ])
            ->dontLogIfAttributesChangedOnly(['updated_at'])
            ->dontSubmitEmptyLogs();
    }

    protected static function boot(): void
    {
        parent::boot();

        SaleReturn::creating(function ($model) {
            if (empty($model->return_number)) {
                $today = now()->format('Ymd');
                $lastReturn = SaleReturn::withTrashed()
                    ->where('return_number', 'like', "RETURN-{$today}-%")
                    ->orderBy('return_number', 'desc')
                    ->value('return_number');

                $sequence = 1;
                if ($lastReturn) {
                    $sequence = (int) substr($lastReturn, -4) + 1;
                }

                $model->return_number = sprintf('RETURN-%s-%04d', $today, $sequence);
            }
        });
    }
}
