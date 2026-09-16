<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('material')->nullable()->after('description');
            $table->string('application')->nullable()->after('material');
            $table->string('manufacturing_process')->nullable()->after('application');
            $table->string('featured_image')->nullable()->after('manufacturing_process');
            $table->boolean('is_featured')->default(false)->after('featured_image');

            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['is_featured']);
            $table->dropColumn(['material', 'application', 'manufacturing_process', 'featured_image', 'is_featured']);
        });
    }
};
