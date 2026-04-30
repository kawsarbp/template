<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class ActivityLogService
{
    public function all(array $filters = [])
    {
        $query = ActivityLog::with(['causer', 'user']);

        $types = [
            'user' => 'App\Models\User',
            'customer' => 'App\Models\Customer',
            'bank_account' => 'App\Models\BankAccount',
            'cashflow_transaction' => 'App\Models\CashflowTransaction',
            'product' => 'App\Models\Product',
        ];

        if (! empty($filters['event'])) {
            $query->where('event', $filters['event']);
        }

        if (isset($filters['type']) && array_key_exists($filters['type'], $types)) {
            $query->where('subject_type', $types[$filters['type']]);
        }

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where(DB::raw('LOWER(description)'), 'LIKE', '%'.strtolower($filters['search']).'%')
                    ->orWhereHas('user', function ($q2) use ($filters) {
                        $q2->where(DB::raw('LOWER(name)'), 'LIKE', '%'.strtolower($filters['search']).'%')
                            ->orWhere(DB::raw('LOWER(username)'), 'LIKE', '%'.strtolower($filters['search']).'%')
                            ->orWhere(DB::raw('LOWER(id)'), 'LIKE', '%'.strtolower($filters['search']).'%');
                    });
            });
        }

        $query->orderBy('id', 'DESC');

        $limit = Arr::get($filters, 'limit', 50);

        return $limit != '-1' ? $query->paginate($limit) : $query->paginate(1000);
    }
}
