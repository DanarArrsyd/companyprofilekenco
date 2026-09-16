<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quality_contents', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('title');
            $table->string('summary')->nullable()->after('slug');
            $table->longText('content')->nullable()->after('summary');
            $table->string('image')->nullable()->after('content');
            $table->unsignedInteger('sort_order')->default(0)->after('image');
        });

        Schema::table('quality_contents', function (Blueprint $table) {
            $table->dropColumn(['type', 'body', 'order']);
        });
    }

    public function down(): void
    {
        Schema::table('quality_contents', function (Blueprint $table) {
            $table->string('type')->nullable();
            $table->longText('body')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->dropColumn(['slug', 'summary', 'content', 'image', 'sort_order']);
        });
    }
};
