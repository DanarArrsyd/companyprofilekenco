<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('capabilities', function (Blueprint $table) {
            $table->string('featured_image')->nullable()->after('description');
            $table->string('icon')->nullable()->after('featured_image');
            $table->boolean('is_featured')->default(false)->after('icon');
            $table->unsignedInteger('sort_order')->default(0)->after('is_featured');

            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::table('capabilities', function (Blueprint $table) {
            $table->dropIndex(['is_featured']);
            $table->dropColumn(['featured_image', 'icon', 'is_featured', 'sort_order']);
        });
    }
};
