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
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(0);
            $table->string('unit')->default('pcs');
            $table->decimal('cost_per_unit', 10, 2)->default(0);
            $table->string('status')->default('In Stock');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
