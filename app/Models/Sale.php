<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PaymentStatus;
use App\Enums\SaleType;
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

class Sale extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'sale_number',
        'customer_id',
        'sale_type',
        'sale_date',
        'total_units',
        'total_amount',
        'discount',
        'total_paid',
        'total_due',
        'payment_status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'payment_status' => PaymentStatus::class,
            'sale_type' => SaleType::class,
            'sale_date' => 'date',
            'total_amount' => 'float',
            'total_paid' => 'float',
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
        return $this->hasMany(SaleItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(SalePayment::class);
    }

    public function recalculatePaymentStatus(): void
    {
        $totalPaid = $this->payments()->sum('amount');
        $totalDue = $this->total_amount - $this->discount - $totalPaid;

        if ($totalDue <= 0) {
            $paymentStatus = PaymentStatus::PAID;
            $totalDue = 0;
        } elseif ($totalPaid > 0) {
            $paymentStatus = PaymentStatus::PARTIAL;
        } else {
            $paymentStatus = PaymentStatus::UNPAID;
        }

        $this->update([
            'total_paid' => $totalPaid,
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
                $viewUrl = url()->route('sales.show', $this->id, false);

                return trans('auth.audit_events.'.$eventName)." <a href='".$viewUrl."' target='_blank'>Sale by ".Auth::user()?->name.'</a>';
            })
            ->logOnly([
                'sale_number',
                'customer_id',
                'sale_type',
                'total_units',
                'total_amount',
                'discount',
                'total_paid',
                'total_due',
                'payment_status',
                'sale_date',
                'notes',
            ])
            ->dontLogIfAttributesChangedOnly(['updated_at'])
            ->dontSubmitEmptyLogs();
    }

    protected static function boot(): void
    {
        parent::boot();

        Sale::creating(function ($model) {
            if (empty($model->sale_number)) {
                $today = now()->format('Ymd');
                $lastSale = Sale::withTrashed()
                    ->where('sale_number', 'like', "SALE-{$today}-%")
                    ->orderBy('sale_number', 'desc')
                    ->value('sale_number');

                $sequence = 1;
                if ($lastSale) {
                    $sequence = (int) substr($lastSale, -4) + 1;
                }

                $model->sale_number = sprintf('SALE-%s-%04d', $today, $sequence);
            }
        });
    }
}
