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
        // User::factory(10)->create();

        // 1. Create Admin User
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@anvys.com',
            'password' => Hash::make('password'),
            'is_admin' => true,
        ]);

        // 2. Create Staff User (Generic)
        User::create([
            'name' => 'Staff Member',
            'email' => 'staff@anvys.com',
            'password' => Hash::make('password'),
            'is_admin' => false,
        ]);

        // 3. Create Locations
        $mainBranch = Location::create([
            'name' => 'Main Branch',
            'address' => '123 Main St, Davao City',
            'status' => 'Active',
        ]);

        $downtownKiosk = Location::create([
            'name' => 'Downtown Kiosk',
            'address' => '456 Downtown Ave, Davao City',
            'status' => 'Active',
        ]);

        $mallPopUp = Location::create([
            'name' => 'Mall Pop-up',
            'address' => '789 SM Mall, Davao City',
            'status' => 'Active',
        ]);

        // 4. Create Employees
        // Admin/Manager (linked to admin user)
        Employee::create([
            'user_id' => 1,
            'employee_id' => 'EMP-001',
            'name' => 'Jonas (Admin)',
            'email' => 'admin@anvys.com',
            'contact_number' => '09171234567',
            'position' => 'Manager',
            'location_id' => $mainBranch->id,
            'daily_rate' => 800.00,
            'status' => 'Active',
        ]);

        // Staff (linked to staff user)
        Employee::create([
            'user_id' => 2,
            'employee_id' => 'EMP-002',
            'name' => 'Sarah Staff',
            'email' => 'staff@anvys.com',
            'contact_number' => '09179876543',
            'position' => 'Cashier',
            'location_id' => $downtownKiosk->id,
            'daily_rate' => 450.00,
            'status' => 'Active',
        ]);

        // Regular Employees (no login)
        Employee::create([
            'employee_id' => 'EMP-003',
            'name' => 'Mike Stockman',
            'email' => null,
            'contact_number' => '09175554444',
            'position' => 'Stock Clerk',
            'location_id' => $mainBranch->id,
            'daily_rate' => 400.00,
            'status' => 'Active',
        ]);

        Employee::create([
            'employee_id' => 'EMP-004',
            'name' => 'Jenny Server',
            'email' => null,
            'contact_number' => '09171112222',
            'position' => 'Server',
            'location_id' => $mallPopUp->id,
            'daily_rate' => 380.00,
            'status' => 'Active',
        ]);
    }
}
