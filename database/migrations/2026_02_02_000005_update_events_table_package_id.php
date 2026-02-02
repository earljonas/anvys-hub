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
        Schema::table('events', function (Blueprint $table) {
            // Drop old string column
            $table->dropColumn('package_id');
            // Add new foreign key column
            $table->foreignId('event_package_id')->after('contact_number')->constrained('event_packages');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign(['event_package_id']);
            $table->dropColumn('event_package_id');
            $table->string('package_id');
        });
    }
};
