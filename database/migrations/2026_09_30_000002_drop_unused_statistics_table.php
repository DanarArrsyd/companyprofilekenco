<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * The statistics table never got a model user: homepage figures live in
 * the "stats" page section's content. Dropped on 2026-09-30 with its unused
 * model, but only while it is empty, so no data can be lost.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('statistics') && ! DB::table('statistics')->exists()) {
            Schema::drop('statistics');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('statistics')) {
            return;
        }

        Schema::create('statistics', function (Blueprint $table) {
            $table->id();
            $table->text('label');
            $table->string('value');
            $table->string('icon')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });
    }
};
