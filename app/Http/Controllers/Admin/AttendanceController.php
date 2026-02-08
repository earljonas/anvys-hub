<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = AttendanceRecord::with('user')
            ->has('user')
            ->orderBy('clock_in', 'desc');

        if ($request->search) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        if ($request->date) {
            $query->whereDate('clock_in', $request->date);
        }

        $records = $query->paginate(5)
            ->withQueryString()
            ->through(function ($record) {
                $data = $record->toArray();
                if ($record->clock_in) {
                    $data['clock_in'] = $record->clock_in->setTimezone('Asia/Manila')->format('Y-m-d H:i:s');
                }
                if ($record->clock_out) {
                    $data['clock_out'] = $record->clock_out->setTimezone('Asia/Manila')->format('Y-m-d H:i:s');
                }
                return $data;
            });

        return Inertia::render('admin/employee/Attendance', [
            'records' => $records,
            'filters' => $request->only(['search', 'date']),
        ]);
    }

    public function approve($id)
    {
        $record = AttendanceRecord::findOrFail($id);
        $record->update(['status' => 'approved']);
        return back()->with('success', 'Attendance record approved.');
    }

    public function reject($id)
    {
        $record = AttendanceRecord::findOrFail($id);
        $record->update(['status' => 'rejected']);
        return back()->with('success', 'Attendance record rejected.');
    }

    public function update(Request $request, $id)
    {
        $record = AttendanceRecord::findOrFail($id);

        $validated = $request->validate([
            'clock_in' => 'required|date',
            'clock_out' => 'nullable|date|after:clock_in',
        ]);

        $clockIn = Carbon::parse($validated['clock_in']);
        $clockOut = $validated['clock_out'] ? Carbon::parse($validated['clock_out']) : null;

        $totalHours = null;
        $overtimeHours = 0;

        if ($clockOut) {
            $minutesWorked = $clockIn->diffInMinutes($clockOut);
            $elapsedHours = $minutesWorked / 60;

            $deduction = ($elapsedHours >= 6) ? 1.0 : 0.0;
            $netHours = max(0, $elapsedHours - $deduction);

            $overtimeHours = max(0, $netHours - 8.0);
            $totalHours = round($netHours, 2);
            $overtimeHours = round($overtimeHours, 2);
        }

        $record->update([
            'clock_in' => $clockIn,
            'clock_out' => $clockOut,
            'total_hours' => $totalHours,
            'overtime_hours' => $overtimeHours,
            'is_edited' => true,
        ]);

        return back()->with('success', 'Attendance record updated successfully.');
    }
}