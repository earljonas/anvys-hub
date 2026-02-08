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
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('name');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('contact_number')->nullable()->after('email');
            $table->string('address')->nullable()->after('contact_number');
            $table->string('clock_pin')->nullable()->after('password');
        });

        // Update Employees Table
        Schema::table('employees', function (Blueprint $table) {
            // Add new columns
            $table->string('job_title')->nullable()->after('location_id');
            $table->string('department')->nullable()->after('job_title');
            $table->string('employment_type')->default('full_time')->after('department');
            $table->decimal('hourly_rate', 10, 2)->default(0)->after('employment_type');
            $table->decimal('basic_salary', 10, 2)->default(0)->after('hourly_rate');
            $table->string('tin_number')->nullable()->after('basic_salary');
            $table->string('sss_number')->nullable()->after('tin_number');
            $table->string('philhealth_number')->nullable()->after('sss_number');
            $table->string('pagibig_number')->nullable()->after('philhealth_number');
            $table->string('bank_details')->nullable()->after('pagibig_number');

            // Drop redundant columns that are now in users table or renamed
            $table->dropColumn(['name', 'email', 'contact_number', 'position', 'daily_rate']);
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
