<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index()
    {
        $employees = User::where('is_admin', false)
            ->select('id', 'name')
            ->get()
            ->map(function ($employee) {
                $todayRecord = AttendanceRecord::where('user_id', $employee->id)
                    ->whereDate('clock_in', Carbon::today())
                    ->latest()
                    ->first();

                $nextShift = \App\Models\Shift::where('user_id', $employee->id)
                    ->where('end_time', '>', now())
                    ->where('status', 'published')
                    ->with('location')
                    ->orderBy('start_time', 'asc')
                    ->first();

                $status = 'idle';
                if ($todayRecord) {
                    if ($todayRecord->clock_out) {
                        $status = 'done';
                    } else {
                        $status = 'active';
                    }
                }

                return [
                    'id' => $employee->id,
                    'name' => $employee->name,
                    'status' => $status,
                    'next_shift' => $nextShift ? [
                        'location' => $nextShift->location?->name ?? 'Unknown',
                        'start' => $nextShift->start_time->setTimezone('Asia/Manila')->format('M d, h:i A'),
                    ] : null,
                ];
            });

        $history = AttendanceRecord::with('user')
            ->where('clock_in', '>=', now()->subDays(30))
            ->orderBy('clock_in', 'desc')
            ->get()
            ->map(function ($record) {
                return [
                    'id' => $record->id,
                    'user_id' => $record->user_id,
                    'user_name' => $record->user->name ?? 'Unknown',
                    'clock_in' => $record->clock_in ? $record->clock_in->toIso8601String() : null,
                    'clock_out' => $record->clock_out ? $record->clock_out->toIso8601String() : null,
                    'total_hours' => $record->total_hours,
                    'status' => $record->status,
                    'is_edited' => $record->is_edited,
                ];
            });

        return Inertia::render('staff/Attendance', [
            'employees' => $employees,
            'history' => $history,
        ]);
    }

    public function clockIn(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'pin' => 'nullable|digits:4',
        ]);

        $userId = $request->user_id;
        $user = User::find($userId);

        if ($user->clock_pin) {
            if (!$request->pin || $request->pin !== $user->clock_pin) {
                return back()->withErrors(['pin' => 'Invalid PIN. Please try again.']);
            }
        }

        $todayRecord = AttendanceRecord::where('user_id', $userId)
            ->whereDate('clock_in', Carbon::today())
            ->first();

        if ($todayRecord) {
            if ($todayRecord->clock_out) {
                return back()->withErrors(['message' => 'You have already completed your shift for today.']);
            }
            return back()->withErrors(['message' => 'You are already clocked in.']);
        }

        AttendanceRecord::create([
            'user_id' => $userId,
            'user_name' => $user->name,
            'clock_in' => now(),
            'status' => 'pending',
        ]);

        return back()
            ->with('success', 'Clocked in successfully at ' . now()->format('h:i A'))
            ->with('last_clocked_id', $userId);
    }

    public function clockOut(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'pin' => 'nullable|digits:4',
        ]);

        $userId = $request->user_id;
        $user = User::find($userId);

        if ($user->clock_pin) {
            if (!$request->pin || $request->pin !== $user->clock_pin) {
                return back()->withErrors(['pin' => 'Invalid PIN. Please try again.'])
                    ->with('last_clocked_id', $userId);
            }
        }

        $record = AttendanceRecord::where('user_id', $userId)
            ->whereNull('clock_out')
            ->latest()
            ->first();

        if (!$record) {
            return back()
                ->withErrors(['message' => 'No active session found.'])
                ->with('last_clocked_id', $userId);
        }

        $clockOut = now();
        $minutesWorked = $record->clock_in->diffInMinutes($clockOut);
        $elapsedHours = $minutesWorked / 60;

        $deduction = ($elapsedHours >= 6) ? 1.0 : 0.0;
        $netHours = max(0, $elapsedHours - $deduction);
        $regularHours = min($netHours, 8.0);
        $overtimeHours = max(0, $netHours - 8.0);

        $record->update([
            'clock_out' => $clockOut,
            'total_hours' => round($netHours, 2),
            'overtime_hours' => round($overtimeHours, 2),
        ]);

        return back()
            ->with('success', 'Clocked out. Paid: ' . round($netHours, 2) . ' hrs (OT: ' . round($overtimeHours, 2) . ')')
            ->with('last_clocked_id', $userId);
    }
}