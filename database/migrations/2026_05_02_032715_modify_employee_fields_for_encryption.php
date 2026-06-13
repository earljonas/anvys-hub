<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->text('hourly_rate')->nullable()->change();
            $table->text('basic_salary')->nullable()->change();
            $table->text('tin_number')->nullable()->change();
            $table->text('sss_number')->nullable()->change();
            $table->text('philhealth_number')->nullable()->change();
            $table->text('pagibig_number')->nullable()->change();
        });

        // Backfill: encrypt existing plaintext data
        \Illuminate\Support\Facades\DB::transaction(function () {
            \Illuminate\Support\Facades\DB::table('employees')->orderBy('id')->chunk(100, function ($employees) {
                foreach ($employees as $employee) {
                    $updates = [];
                    
                    $fields = ['hourly_rate', 'basic_salary', 'tin_number', 'sss_number', 'philhealth_number', 'pagibig_number'];
                    foreach ($fields as $field) {
                        if ($employee->$field !== null) {
                            try {
                                // Check if already encrypted
                                \Illuminate\Support\Facades\Crypt::decryptString($employee->$field);
                            } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
                                // If it throws, it's plaintext; encrypt it
                                $updates[$field] = \Illuminate\Support\Facades\Crypt::encryptString((string) $employee->$field);
                            }
                        }
                    }

                    if (!empty($updates)) {
                        \Illuminate\Support\Facades\DB::table('employees')->where('id', $employee->id)->update($updates);
                    }
                }
            });
        });
    }

    public function down(): void
    {
        // Decrypt data before reverting schema
        \Illuminate\Support\Facades\DB::transaction(function () {
            \Illuminate\Support\Facades\DB::table('employees')->orderBy('id')->chunk(100, function ($employees) {
                foreach ($employees as $employee) {
                    $updates = [];
                    
                    $fields = ['hourly_rate', 'basic_salary', 'tin_number', 'sss_number', 'philhealth_number', 'pagibig_number'];
                    foreach ($fields as $field) {
                        if ($employee->$field !== null) {
                            try {
                                $updates[$field] = \Illuminate\Support\Facades\Crypt::decryptString($employee->$field);
                            } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
                                // If it's already plaintext, leave it alone
                            }
                        }
                    }

                    if (!empty($updates)) {
                        \Illuminate\Support\Facades\DB::table('employees')->where('id', $employee->id)->update($updates);
                    }
                }
            });
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->decimal('hourly_rate', 10, 2)->default(0)->change();
            $table->decimal('basic_salary', 10, 2)->default(0)->change();
            $table->string('tin_number')->nullable()->change();
            $table->string('sss_number')->nullable()->change();
            $table->string('philhealth_number')->nullable()->change();
            $table->string('pagibig_number')->nullable()->change();
        });
    }
};
