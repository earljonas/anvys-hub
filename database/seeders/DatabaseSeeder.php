<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Location;
use App\Models\Employee;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@anvys.com'],
            [
                'name' => 'Administrator',
                'first_name' => 'Jonas',
                'last_name' => 'Admin',
                'contact_number' => '09171234567',
                'password' => Hash::make('password'),
                'is_admin' => true,
            ]
        );

        // 2. Create Staff User
        $staff = User::firstOrCreate(
            ['email' => 'staff@anvys.com'],
            [
                'name' => 'Staff Member',
                'first_name' => 'Sarah',
                'last_name' => 'Staff',
                'contact_number' => '09179876543',
                'password' => Hash::make('password'),
                'is_admin' => false,
            ]
        );

        // 3. Create additional Users for employees without login
        $mike = User::firstOrCreate(
            ['email' => 'mike@anvys.com'],
            [
                'name' => 'Mike Stockman',
                'first_name' => 'Mike',
                'last_name' => 'Stockman',
                'contact_number' => '09175554444',
                'password' => Hash::make('password'),
                'is_admin' => false,
            ]
        );

        $jenny = User::firstOrCreate(
            ['email' => 'jenny@anvys.com'],
            [
                'name' => 'Jenny Server',
                'first_name' => 'Jenny',
                'last_name' => 'Server',
                'contact_number' => '09171112222',
                'password' => Hash::make('password'),
                'is_admin' => false,
            ]
        );

        // 4. Create Locations
        $mainBranch = Location::firstOrCreate(
            ['name' => 'Main Branch'],
            ['address' => '123 Main St, Davao City', 'status' => 'Active']
        );

        $downtownKiosk = Location::firstOrCreate(
            ['name' => 'Downtown Kiosk'],
            ['address' => '456 Downtown Ave, Davao City', 'status' => 'Active']
        );

        $mallPopUp = Location::firstOrCreate(
            ['name' => 'Mall Pop-up'],
            ['address' => '789 SM Mall, Davao City', 'status' => 'Active']
        );

        // 5. Create Employees (matches current schema — no name/email/position/daily_rate)
        Employee::firstOrCreate(
            ['employee_id' => 'EMP-001'],
            [
                'user_id' => $admin->id,
                'location_id' => $mainBranch->id,
                'job_title' => 'Manager',
                'department' => 'Management',
                'employment_type' => 'full_time',
                'hourly_rate' => 100.00,
                'basic_salary' => 20800.00,
            ]
        );

        Employee::firstOrCreate(
            ['employee_id' => 'EMP-002'],
            [
                'user_id' => $staff->id,
                'location_id' => $downtownKiosk->id,
                'job_title' => 'Cashier',
                'department' => 'Operations',
                'employment_type' => 'full_time',
                'hourly_rate' => 56.25,
                'basic_salary' => 11700.00,
            ]
        );

        Employee::firstOrCreate(
            ['employee_id' => 'EMP-003'],
            [
                'user_id' => $mike->id,
                'location_id' => $mainBranch->id,
                'job_title' => 'Stock Clerk',
                'department' => 'Inventory',
                'employment_type' => 'full_time',
                'hourly_rate' => 50.00,
                'basic_salary' => 10400.00,
            ]
        );

        Employee::firstOrCreate(
            ['employee_id' => 'EMP-004'],
            [
                'user_id' => $jenny->id,
                'location_id' => $mallPopUp->id,
                'job_title' => 'Server',
                'department' => 'Operations',
                'employment_type' => 'full_time',
                'hourly_rate' => 47.50,
                'basic_salary' => 9880.00,
            ]
        );

        // 6. Run POS Seeder
        $this->call([
            POSSeeder::class,
        ]);

        // 7. Run Event Package Seeder
        $this->call([
            EventPackageSeeder::class,
        ]);
    }
}
