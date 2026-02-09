<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\User;
use App\Services\AttendanceService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    protected $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    public function index()
    {
        $employeesList = User::where('is_admin', false)
            ->select('id', 'name')
            ->get();

        $employeeIds = $employeesList->pluck('id');

        // Pre-fetch today's latest records
        $todayRecords = AttendanceRecord::whereIn('user_id', $employeeIds)
            ->whereDate('clock_in', Carbon::today())
            ->orderBy('clock_in', 'desc')
            ->get()
            ->groupBy('user_id');

        // Pre-fetch next shifts
        $nextShifts = \App\Models\Shift::whereIn('user_id', $employeeIds)
            ->where('end_time', '>', now())
            ->where('status', 'published')
            ->with('location')
            ->orderBy('start_time', 'asc')
            ->get()
            ->groupBy('user_id');

        $employees = $employeesList->map(function ($employee) use ($todayRecords, $nextShifts) {
            $todayRecord = $todayRecords->get($employee->id)?->first();
            $nextShift = $nextShifts->get($employee->id)?->first();

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
            ->where('user_id', auth()->id())
            ->where('clock_in', '>=', now()->subDays(30))
            ->orderBy('clock_in', 'desc')
            ->paginate(50)
            ->through(function ($record) {
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
            'pin' => 'nullable|digits:4',
        ]);

        $user = auth()->user();
        $userId = $user->id;

        if ($user->clock_pin) {
            if (!$request->pin || $request->pin !== $user->clock_pin) {
                return back()->withErrors(['pin' => 'Invalid PIN. Please try again.']);
            }
        }

        $todayRecord = AttendanceRecord::where('user_id', $userId)
            ->whereDate('clock_in', Carbon::today())
            ->latest()
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
            ->with('status', 'active');
    }

    public function clockOut(Request $request)
    {
        $request->validate([
            'pin' => 'nullable|digits:4',
        ]);

        $user = auth()->user();
        $userId = $user->id;

        if ($user->clock_pin) {
            if (!$request->pin || $request->pin !== $user->clock_pin) {
                return back()->withErrors(['pin' => 'Invalid PIN. Please try again.']);
            }
        }

        $record = AttendanceRecord::where('user_id', $userId)
            ->whereNull('clock_out')
            ->latest()
            ->first();

        if (!$record) {
            return back()
                ->withErrors(['message' => 'No active session found.']);
        }

        $clockOut = now();
        $hours = $this->attendanceService->calculateHoursWorked($record->clock_in, $clockOut);

        $record->update([
            'clock_out' => $clockOut,
            'total_hours' => $hours['total_hours'],
            'overtime_hours' => $hours['overtime_hours'],
        ]);

        return back()
            ->with('success', 'Clocked out. Paid: ' . $hours['total_hours'] . ' hrs (OT: ' . $hours['overtime_hours'] . ')')
            ->with('status', 'done');
    }
}