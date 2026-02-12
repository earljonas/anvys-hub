<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update Users Table
        // Update Users Table
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'first_name')) {
                $table->string('first_name')->nullable()->after('name');
            }
            if (!Schema::hasColumn('users', 'last_name')) {
                $table->string('last_name')->nullable()->after('first_name');
            }
            if (!Schema::hasColumn('users', 'contact_number')) {
                $table->string('contact_number')->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'address')) {
                $table->string('address')->nullable()->after('contact_number');
            }
            if (!Schema::hasColumn('users', 'clock_pin')) {
                $table->string('clock_pin')->nullable()->after('password');
            }
        });

        // Update Employees Table
        // Update Employees Table
        Schema::table('employees', function (Blueprint $table) {
            // Add new columns
            if (!Schema::hasColumn('employees', 'job_title')) {
                $table->string('job_title')->nullable()->after('location_id');
            }
            if (!Schema::hasColumn('employees', 'department')) {
                $table->string('department')->nullable()->after('job_title');
            }
            if (!Schema::hasColumn('employees', 'employment_type')) {
                $table->string('employment_type')->default('full_time')->after('department');
            }
            if (!Schema::hasColumn('employees', 'hourly_rate')) {
                $table->decimal('hourly_rate', 10, 2)->default(0)->after('employment_type');
            }
            if (!Schema::hasColumn('employees', 'basic_salary')) {
                $table->decimal('basic_salary', 10, 2)->default(0)->after('hourly_rate');
            }
            if (!Schema::hasColumn('employees', 'tin_number')) {
                $table->string('tin_number')->nullable()->after('basic_salary');
            }
            if (!Schema::hasColumn('employees', 'sss_number')) {
                $table->string('sss_number')->nullable()->after('tin_number');
            }
            if (!Schema::hasColumn('employees', 'philhealth_number')) {
                $table->string('philhealth_number')->nullable()->after('sss_number');
            }
            if (!Schema::hasColumn('employees', 'pagibig_number')) {
                $table->string('pagibig_number')->nullable()->after('philhealth_number');
            }
            if (!Schema::hasColumn('employees', 'bank_details')) {
                $table->string('bank_details')->nullable()->after('pagibig_number');
            }

            // Drop redundant columns that are now in users table or renamed
            $columnsToDrop = [];
            if (Schema::hasColumn('employees', 'name')) $columnsToDrop[] = 'name';
            if (Schema::hasColumn('employees', 'email')) $columnsToDrop[] = 'email';
            if (Schema::hasColumn('employees', 'contact_number')) $columnsToDrop[] = 'contact_number';
            if (Schema::hasColumn('employees', 'position')) $columnsToDrop[] = 'position';
            if (Schema::hasColumn('employees', 'daily_rate')) $columnsToDrop[] = 'daily_rate';
            
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name', 'contact_number', 'address', 'clock_pin']);
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('position')->nullable();
            $table->decimal('daily_rate', 10, 2)->default(0);

            $table->dropColumn([
                'job_title',
                'department',
                'employment_type',
                'hourly_rate',
                'basic_salary',
                'tin_number',
                'sss_number',
                'philhealth_number',
                'pagibig_number',
                'bank_details'
            ]);
        });
    }
};
