<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with('user:id,first_name,last_name,email')
            ->latest();

        // Optional filtering by action
        if ($request->has('action') && $request->action !== 'all') {
            $query->where('action', $request->action);
        }

        // Optional filtering by subject type
        if ($request->has('subject_type') && $request->subject_type !== 'all') {
            $query->where('subject_type', 'like', '%' . $request->subject_type . '%');
        }

        $logs = $query->paginate(20)->through(function ($log) {
            return [
                'id' => $log->id,
                'user' => $log->user ? $log->user->first_name . ' ' . $log->user->last_name : 'System/CLI',
                'user_email' => $log->user ? $log->user->email : null,
                'action' => $log->action,
                'subject_type' => class_basename($log->subject_type),
                'subject_id' => $log->subject_id,
                'old_values' => $log->old_values,
                'new_values' => $log->new_values,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at->format('M d, Y h:i A'),
            ];
        });

        return Inertia::render('admin/reports/AuditLogs', [
            'logs' => $logs,
            'filters' => $request->only(['action', 'subject_type']),
        ]);
    }
}
