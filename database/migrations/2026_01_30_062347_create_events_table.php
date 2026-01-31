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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('customer_name');
            $table->string('address')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('package_id');
            $table->date('event_date');
            $table->string('event_time'); // Keeping as string to match input '12:00' easily or standard time column
            $table->integer('extra_guests')->default(0);
            $table->decimal('total_price', 10, 2);
            $table->string('payment_status')->default('Pending'); // Paid, Partial, Pending
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
