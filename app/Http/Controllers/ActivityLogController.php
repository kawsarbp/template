<?php

namespace App\Http\Controllers;

use App\Http\Resources\ActivityLog\ActivityLogResource;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function __construct(protected ActivityLogService $service) {}

    public function index(Request $request)
    {
        $data = ActivityLogResource::collection($this->service->all($request->all()));

        return inertia('AuditLog/AuditLogs', ['data' => $data]);
    }

    public function show($id, $type)
    {
        $auditLog = Activity::with('causer')->findOrFail($id);

        $logDetails = [
            'attributes' => $auditLog->properties['attributes'] ?? [],
            'old' => $auditLog->properties['old'] ?? [],
            'subject_type' => $auditLog->subject_type,
            'event' => $auditLog->event,
            'causer_name' => optional($auditLog->causer)->name,
            'created_at' => $auditLog->created_at->format('M d Y, h:i a'),
        ];

        return inertia('ActivityLog/AuditLogDetails', [
            'auditLog' => $logDetails,
            'type' => $type,
        ]);
    }

    public function activityList($type, $id)
    {
        $type = convertToSnakeCase($type);

        $typesMapping = [
            'user' => 'App\Models\User',
            'customer' => 'App\Models\Customer',
            'bank_account' => 'App\Models\BankAccount',
            'cashflow_transaction' => 'App\Models\CashflowTransaction',
            'product' => 'App\Models\Product',
        ];
        if (! array_key_exists($type, $typesMapping)) {
            abort(404, 'Invalid module type.');
        }

        $auditLogs = Activity::with('causer')->where('subject_type', $typesMapping[$type])
            ->where('subject_id', $id)
            ->orderBy('id', 'DESC')
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'event' => $log->event,
                    'causer_name' => optional($log->causer)->name,
                    'created_at' => $log->created_at->format('M d Y, h:i a'),
                    'attributes' => $log->properties['attributes'] ?? [],
                    'old' => $log->properties['old'] ?? [],
                    'subject_type' => $log->subject_type,
                ];
            });

        /*if ($type == 'bank_account') {
            return inertia('ActivityLog/BankAccount', [
                'auditLogs' => $auditLogs,
                'type' => $type,
            ]);
        }*/

        return inertia('AuditLog/AuditLogHistory', [
            'auditLogs' => $auditLogs,
            'type' => $type,
        ]);
    }
}
