<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('is_admin', false)
            ->with('employee.location')
            ->orderBy('created_at', 'desc');

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->status === 'Archived') {
            $query->onlyTrashed();
        }

        $employees = $query->paginate(10)->withQueryString();

        $employees->getCollection()->transform(function ($user) {
            $user->makeVisible('clock_pin');
            return $user;
        });

        return Inertia::render('admin/employee/Employees', [
            'employees' => $employees,
            'filters' => $request->only(['search', 'status']),
            'locations' => Location::where('status', 'Active')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'address' => 'required|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'location_id' => 'nullable|exists:locations,id',
            'employment_type' => 'nullable|string',
            'hourly_rate' => 'nullable|numeric|min:0',
            'basic_salary' => 'nullable|numeric|min:0',
            'tin_number' => 'nullable|string|max:50',
            'sss_number' => 'nullable|string|max:50',
            'philhealth_number' => 'nullable|string|max:50',
            'pagibig_number' => 'nullable|string|max:50',
            'clock_pin' => 'nullable|digits:4',
        ]);

        // Email Generation Logic
        $firstName = preg_replace('/[^a-z0-9]/', '', strtolower(Str::ascii($validated['first_name'])));
        $lastName = preg_replace('/[^a-z0-9]/', '', strtolower(Str::ascii($validated['last_name'])));
        $baseEmail = $firstName . '.' . $lastName;

        $email = $baseEmail . '@anvys.com';
        $count = 1;
        while (User::where('email', $email)->exists()) {
            $email = $baseEmail . $count . '@anvys.com';
            $count++;
        }

        $user = User::create([
            'name' => $validated['first_name'] . ' ' . $validated['last_name'],
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'contact_number' => $validated['contact_number'],
            'address' => $validated['address'],
            'email' => $email,
            'password' => Hash::make('password'),
            'clock_pin' => $validated['clock_pin'] ?? null,
            'is_admin' => false,
        ]);

        // FIXED: Changed 'employeeProfile()' to 'employee()'
        $user->employee()->create([
            'employee_id' => 'EMP-' . str_pad($user->id, 5, '0', STR_PAD_LEFT),
            'job_title' => $validated['job_title'] ?? 'Staff',
            'department' => $validated['department'] ?? 'Operations',
            'location_id' => $validated['location_id'] ?? null,
            'employment_type' => $validated['employment_type'] ?? 'full_time',
            'hourly_rate' => $validated['hourly_rate'] ?? 0,
            'basic_salary' => $validated['basic_salary'] ?? 0,
            'tin_number' => $validated['tin_number'] ?? null,
            'sss_number' => $validated['sss_number'] ?? null,
            'philhealth_number' => $validated['philhealth_number'] ?? null,
            'pagibig_number' => $validated['pagibig_number'] ?? null,
        ]);

        return back()->with('success', 'Employee created successfully.');
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'address' => 'required|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'location_id' => 'nullable|exists:locations,id',
            'employment_type' => 'nullable|string',
            'hourly_rate' => 'nullable|numeric|min:0',
            'basic_salary' => 'nullable|numeric|min:0',
            'tin_number' => 'nullable|string|max:50',
            'sss_number' => 'nullable|string|max:50',
            'philhealth_number' => 'nullable|string|max:50',
            'pagibig_number' => 'nullable|string|max:50',
            'clock_pin' => 'nullable|digits:4',
        ]);

        $user->update([
            'name' => $validated['first_name'] . ' ' . $validated['last_name'],
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'contact_number' => $validated['contact_number'],
            'address' => $validated['address'],
            'clock_pin' => $validated['clock_pin'] ?? $user->clock_pin,
        ]);

        $employeeData = [
            'job_title' => $validated['job_title'] ?? null,
            'department' => $validated['department'] ?? null,
            'location_id' => $validated['location_id'] ?? null,
            'employment_type' => $validated['employment_type'] ?? 'full_time',
            'hourly_rate' => $validated['hourly_rate'] ?? 0,
            'basic_salary' => $validated['basic_salary'] ?? 0,
            'tin_number' => $validated['tin_number'] ?? null,
            'sss_number' => $validated['sss_number'] ?? null,
            'philhealth_number' => $validated['philhealth_number'] ?? null,
            'pagibig_number' => $validated['pagibig_number'] ?? null,
        ];

        if ($user->employee) {
            $user->employee->update($employeeData);
        } else {
            $employeeData['employee_id'] = 'EMP-' . str_pad($user->id, 5, '0', STR_PAD_LEFT);
            $user->employee()->create($employeeData);
        }

        return back()->with('success', 'Employee details updated successfully.');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        if ($user->is_admin) {
            return back()->with('error', 'Cannot delete admin accounts.');
        }

        DB::transaction(function () use ($user) {
            if ($user->employee) {
                $user->employee()->delete();
            }
            $user->delete();
        });

        return back()->with('success', 'Employee archived successfully.');
    }

    public function restore($id)
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();

        // Restore associated employee record if it exists and was soft deleted
        if ($user->employee()->onlyTrashed()->exists()) {
            $user->employee()->restore();
        }

        return back()->with('success', 'Employee restored successfully.');
    }
}