<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    /**
     * Display a listing of employees (for Roster page).
     */
    public function index()
    {
        $employees = Employee::with('location')->get()->map(function ($employee) {
            return [
                'id' => $employee->id,
                'employeeId' => $employee->employee_id,
                'name' => $employee->name,
                'email' => $employee->email,
                'contactNumber' => $employee->contact_number,
                'position' => $employee->position,
                'location' => $employee->location?->name ?? 'Unassigned',
                'locationId' => $employee->location_id,
                'rate' => $employee->daily_rate,
                'status' => $employee->status,
            ];
        });

        $locations = Location::where('status', 'Active')->get(['id', 'name']);

        return Inertia::render('admin/Roster', [
            'employees' => $employees,
            'locations' => $locations,
        ]);
    }

    /**
     * Store a newly created employee.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'contactNumber' => 'nullable|string|max:20',
            'position' => 'required|string|max:255',
            'locationId' => 'nullable|exists:locations,id',
            'rate' => 'required|numeric|min:0',
        ]);

        Employee::create([
            'employee_id' => Employee::generateEmployeeId(),
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'contact_number' => $validated['contactNumber'] ?? null,
            'position' => $validated['position'],
            'location_id' => $validated['locationId'] ?? null,
            'daily_rate' => $validated['rate'],
            'status' => 'Active',
        ]);

        return redirect()->back()->with('success', 'Employee added successfully.');
    }

    /**
     * Update the specified employee.
     */
    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'contactNumber' => 'nullable|string|max:20',
            'position' => 'required|string|max:255',
            'locationId' => 'nullable|exists:locations,id',
            'rate' => 'required|numeric|min:0',
            'status' => 'required|in:Active,Inactive',
        ]);

        $employee->update([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'contact_number' => $validated['contactNumber'] ?? null,
            'position' => $validated['position'],
            'location_id' => $validated['locationId'] ?? null,
            'daily_rate' => $validated['rate'],
            'status' => $validated['status'],
        ]);

        return redirect()->back()->with('success', 'Employee updated successfully.');
    }

    /**
     * Archive (soft delete) the specified employee.
     */
    public function archive(Employee $employee)
    {
        $employee->update(['status' => 'Inactive']);
        $employee->delete();

        return redirect()->back()->with('success', 'Employee archived successfully.');
    }

    /**
     * Restore an archived employee.
     */
    public function restore($id)
    {
        $employee = Employee::withTrashed()->findOrFail($id);
        $employee->restore();
        $employee->update(['status' => 'Active']);

        return redirect()->back()->with('success', 'Employee restored successfully.');
    }
}
