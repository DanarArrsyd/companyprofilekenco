<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // InnoDB needs an index covering capability_id for its FK at all
        // times, so add a temporary single-column one before touching the
        // existing composite index that currently satisfies that need.
        Schema::table('capability_steps', function (Blueprint $table) {
            $table->index('capability_id', 'capability_steps_capability_id_tmp_index');
        });

        Schema::table('capability_steps', function (Blueprint $table) {
            $table->dropIndex(['capability_id', 'order']);
        });

        Schema::table('capability_steps', function (Blueprint $table) {
            $table->unsignedInteger('sort_order')->default(0)->after('description');
        });

        Schema::table('capability_steps', function (Blueprint $table) {
            $table->dropColumn('order');
        });

        Schema::table('capability_steps', function (Blueprint $table) {
            $table->index(['capability_id', 'sort_order']);
        });

        Schema::table('capability_steps', function (Blueprint $table) {
            $table->dropIndex('capability_steps_capability_id_tmp_index');
        });
    }

    public function down(): void
    {
        Schema::table('capability_steps', function (Blueprint $table) {
            $table->index('capability_id', 'capability_steps_capability_id_tmp_index');
        });

        Schema::table('capability_steps', function (Blueprint $table) {
            $table->dropIndex(['capability_id', 'sort_order']);
        });

        Schema::table('capability_steps', function (Blueprint $table) {
            $table->unsignedInteger('order')->default(0);
        });

        Schema::table('capability_steps', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });

        Schema::table('capability_steps', function (Blueprint $table) {
            $table->index(['capability_id', 'order']);
        });

        Schema::table('capability_steps', function (Blueprint $table) {
            $table->dropIndex('capability_steps_capability_id_tmp_index');
        });
    }
};
