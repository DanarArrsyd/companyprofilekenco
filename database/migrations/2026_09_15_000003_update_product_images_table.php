<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            $table->string('path')->nullable()->after('media_id');
            $table->string('alt_text')->nullable()->after('path');
        });

        // Direct-storage gallery images (Phase 6) don't require a central
        // media library record, so media_id must become optional.
        Schema::table('product_images', function (Blueprint $table) {
            $table->unsignedBigInteger('media_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            $table->dropColumn(['path', 'alt_text']);
        });

        Schema::table('product_images', function (Blueprint $table) {
            $table->unsignedBigInteger('media_id')->nullable(false)->change();
        });
    }
};
