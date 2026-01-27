<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin User
        User::create([
            'name' => 'Admin',
            'email' => 'admin@anvys.com',
            'password' => Hash::make('password'),
            'is_admin' => true,
        ]);

        // Create Staff User
        User::create([
            'name' => 'Staff User',
            'email' => 'staff@anvys.com',
            'password' => Hash::make('password'),
            'is_admin' => false,
        ]);
    }
}