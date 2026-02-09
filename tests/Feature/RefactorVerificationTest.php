<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Employee;
use App\Models\AttendanceRecord;
use App\Services\PayrollService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Illuminate\Support\Facades\DB;

class RefactorVerificationTest extends TestCase
{
    use DatabaseTransactions;

    public function test_user_is_admin_is_protected_from_mass_assignment()
    {
        $userData = [
            'name' => 'Test User ' . uniqid(),
            'email' => 'test_user_' . uniqid() . '@example.com',
            'password' => 'password',
            'is_admin' => true,
        ];

        // Create user using mass assignment
        $user = new User($userData);
        $user->save();

        // Refresh from DB to be sure
        $user->refresh();

        $this->assertFalse((bool) $user->is_admin, 'is_admin should be false as it is not fillable');
    }

    public function test_payroll_days_worked_counts_unique_dates_only()
    {
        // 1. Create User & Employee
        $user = User::factory()->create([
            'first_name' => 'Test',
            'last_name' => 'Employee'
        ]);

        $employee = new Employee();
        $employee->user_id = $user->id;
        $employee->employee_id = 'EMP-' . str_pad($user->id, 5, '0', STR_PAD_LEFT);
        // employee does not have first/last name
        $employee->job_title = 'Staff';
        $employee->department = 'Sales';
        $employee->basic_salary = 15000;
        $employee->hourly_rate = 100;
        $employee->save();

        // Reload user to get relation
        $user = User::with('employee')->find($user->id);

        // 2. Create Attendance Records
        // Two records on same day (e.g. split shift or error)
        AttendanceRecord::create([
            'user_id' => $user->id,
            'clock_in' => '2023-01-01 08:00:00',
            'clock_out' => '2023-01-01 12:00:00',
            'total_hours' => 4,
            'status' => 'approved'
        ]);
        AttendanceRecord::create([
            'user_id' => $user->id,
            'clock_in' => '2023-01-01 13:00:00',
            'clock_out' => '2023-01-01 17:00:00',
            'total_hours' => 4,
            'status' => 'approved'
        ]);

        // Another day
        AttendanceRecord::create([
            'user_id' => $user->id,
            'clock_in' => '2023-01-02 08:00:00',
            'clock_out' => '2023-01-02 17:00:00',
            'total_hours' => 9,
            'status' => 'approved'
        ]);

        // 3. Calculate Payroll
        $service = new PayrollService();

        if (method_exists($service, 'calculateForUser')) {
            $result = $service->calculateForUser($user, '2023-01-01', '2023-01-31');

            // Result structure based on code: ['days_worked' => ..., 'gross_pay' => ..., ...]
            $this->assertEquals(2, $result['days_worked'], 'Should count 2 unique days, not 3 records');
        } else {
            $this->markTestSkipped('calculateForUser method not customizable/public for testing');
        }
    }
}
