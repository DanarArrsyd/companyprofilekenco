<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('machines', function (Blueprint $table) {
            $table->string('brand')->nullable()->after('name');
            $table->string('model')->nullable()->after('brand');
            $table->unsignedInteger('quantity')->default(1)->after('model');
            $table->string('capacity')->nullable()->after('quantity');
            $table->text('specification')->nullable()->after('description');
            $table->string('image')->nullable()->after('specification');
            $table->unsignedInteger('sort_order')->default(0)->after('image');
            $table->string('status')->default('published')->after('sort_order');

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('machines', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropColumn(['brand', 'model', 'quantity', 'capacity', 'specification', 'image', 'sort_order', 'status']);
        });
    }
};
