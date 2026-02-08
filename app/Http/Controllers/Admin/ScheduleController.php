<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $startOfWeek = $request->query('start_date')
            ? Carbon::parse($request->query('start_date'))->startOfWeek()
            : now()->startOfWeek();

        $endOfWeek = $startOfWeek->copy()->endOfWeek();

        $locations = \App\Models\Location::where('status', 'Active')->get();

        $employees = \App\Models\User::where('is_admin', false)
            ->with('employee.location')
            ->orderBy('created_at', 'desc')
            ->paginate(5)
            ->withQueryString();

        $shifts = \App\Models\Shift::with(['user', 'location'])
            ->whereIn('user_id', $employees->pluck('id'))
            ->whereBetween('start_time', [$startOfWeek, $endOfWeek])
            ->get();

        return Inertia::render('admin/employee/Schedule', [
            'shifts' => $shifts,
            'employees' => $employees,
            'locations' => $locations,
            'weekStart' => $startOfWeek->format('Y-m-d'),
        ]);
    }

    public function staffIndex(Request $request)
    {
        $startOfWeek = $request->query('start_date')
            ? Carbon::parse($request->query('start_date'))->startOfWeek()
            : now()->startOfWeek();

        $endOfWeek = $startOfWeek->copy()->endOfWeek();

        $employees = \App\Models\User::where('is_admin', false)
            ->orderBy('created_at', 'desc')
            ->paginate(5)
            ->withQueryString();

        $shifts = \App\Models\Shift::with(['user', 'location'])
            ->whereIn('user_id', $employees->pluck('id'))
            ->whereBetween('start_time', [$startOfWeek, $endOfWeek])
            ->where('status', 'published')
            ->get();

        return Inertia::render('staff/Schedule', [
            'shifts' => $shifts,
            'employees' => $employees,
            'weekStart' => $startOfWeek->format('Y-m-d'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'location_id' => 'nullable|exists:locations,id',
            'notes' => 'nullable|string',
        ]);

        $date = Carbon::parse($validated['date']);

        $existingShift = \App\Models\Shift::where('user_id', $validated['user_id'])
            ->whereDate('start_time', $date->toDateString())
            ->first();

        if ($existingShift) {
            return back()->withErrors([
                'date' => 'This employee already has a shift scheduled on this date.'
            ]);
        }

        $start = Carbon::parse($validated['start_time']);
        $end = Carbon::parse($validated['end_time']);

        if ($end->lessThan($start)) {
            $end->addDay();
        }

        $locationId = $validated['location_id'] ?? null;
        if (!$locationId) {
            $user = \App\Models\User::with('employee')->find($validated['user_id']);
            $locationId = $user->employee->location_id ?? null;
        }

        \App\Models\Shift::create([
            'user_id' => $validated['user_id'],
            'location_id' => $locationId,
            'start_time' => $start,
            'end_time' => $end,
            'status' => 'draft',
            'notes' => $validated['notes'],
        ]);

        return back()->with('success', 'Shift created successfully.');
    }

    public function publish(Request $request)
    {
        $startOfWeek = Carbon::parse($request->input('week_start'))->startOfWeek();
        $endOfWeek = $startOfWeek->copy()->endOfWeek();

        \App\Models\Shift::whereBetween('start_time', [$startOfWeek, $endOfWeek])
            ->where('status', 'draft')
            ->update(['status' => 'published']);

        return back()->with('success', 'Schedule published successfully.');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'location_id' => 'nullable|exists:locations,id',
            'notes' => 'nullable|string',
        ]);

        $shift = \App\Models\Shift::findOrFail($id);
        $date = Carbon::parse($validated['date']);

        $existingShift = \App\Models\Shift::where('user_id', $shift->user_id)
            ->whereDate('start_time', $date->toDateString())
            ->where('id', '!=', $id)
            ->first();

        if ($existingShift) {
            return back()->withErrors([
                'date' => 'This employee already has a shift scheduled on this date.'
            ]);
        }

        $start = Carbon::parse($validated['start_time']);
        $end = Carbon::parse($validated['end_time']);

        if ($end->lessThan($start)) {
            $end->addDay();
        }

        $shift->update([
            'start_time' => $start,
            'end_time' => $end,
            'location_id' => $validated['location_id'] ?? null,
            'notes' => $validated['notes'],
        ]);

        return back()->with('success', 'Shift updated successfully.');
    }

    public function destroy($id)
    {
        \App\Models\Shift::findOrFail($id)->delete();
        return back()->with('success', 'Shift deleted successfully.');
    }
}