<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;

class StockPurchase extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'supplier_id',
        'currency',
        'exchange_rate',
        'batch_number',
        'total_units',
        'total_amount',
        'discount',
        'total_paid',
        'total_due',
        'payment_status',
        'purchase_date',
        'notes',
        'attachment',
    ];

    protected function casts(): array
    {
        return [
            'payment_status' => PaymentStatus::class,
            'purchase_date' => 'date',
            'total_amount' => 'float',
            'total_paid' => 'float',
            'total_due' => 'float',
            'discount' => 'float',
            'exchange_rate' => 'float',
            'attachment' => 'array',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(StockPurchaseItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(StockPurchasePayment::class);
    }

    public function stocks(): HasManyThrough
    {
        return $this->hasManyThrough(Stock::class, StockPurchaseItem::class);
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
                $viewUrl = url()->route('stock-purchases.show', $this->id, false);

                return trans('auth.audit_events.'.$eventName)." <a href='".$viewUrl."' target='_blank'>Stock Purchase by ".Auth::user()?->name.'</a>';
            })
            ->logOnly([
                'batch_number',
                'supplier_id',
                'currency',
                'exchange_rate',
                'total_units',
                'total_amount',
                'discount',
                'total_paid',
                'total_due',
                'payment_status',
                'purchase_date',
                'notes',
            ])
            ->dontLogIfAttributesChangedOnly(['updated_at'])
            ->dontSubmitEmptyLogs();
    }

    protected static function boot(): void
    {
        parent::boot();

        StockPurchase::creating(function ($model) {
            if (empty($model->batch_number)) {
                $today = now()->format('Ymd');
                $lastBatch = StockPurchase::withTrashed()
                    ->where('batch_number', 'like', "BATCH-{$today}-%")
                    ->orderBy('batch_number', 'desc')
                    ->value('batch_number');

                $sequence = 1;
                if ($lastBatch) {
                    $sequence = (int) substr($lastBatch, -4) + 1;
                }

                $model->batch_number = sprintf('BATCH-%s-%04d', $today, $sequence);
            }
        });
    }
}
