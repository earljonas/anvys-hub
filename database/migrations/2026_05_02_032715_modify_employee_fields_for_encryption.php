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
    }

    public function down(): void
    {
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
