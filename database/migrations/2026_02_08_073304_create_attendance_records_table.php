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
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('attendance_records');
        Schema::enableForeignKeyConstraints();

        Schema::create('attendance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('user_name')->nullable();
            $table->dateTime('clock_in');
            $table->dateTime('clock_out')->nullable();
            $table->decimal('total_hours', 10, 2)->nullable();
            $table->string('status')->default('pending');
            $table->foreignId('shift_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_edited')->default(false);
            $table->dateTime('break_start')->nullable();
            $table->dateTime('break_end')->nullable();
            $table->decimal('overtime_hours', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
    }
};
