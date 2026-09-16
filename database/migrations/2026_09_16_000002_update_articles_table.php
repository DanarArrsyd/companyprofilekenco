<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->longText('content')->nullable()->after('excerpt');
            $table->string('featured_image')->nullable()->after('content');
            $table->foreignId('author_id')->nullable()->after('featured_image')->constrained('users')->nullOnDelete();
            $table->boolean('is_featured')->default(false)->after('author_id');
        });

        Schema::table('articles', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cover_media_id');
        });

        Schema::table('articles', function (Blueprint $table) {
            $table->dropColumn('body');
        });
    }

    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->longText('body')->nullable();
            $table->foreignId('cover_media_id')->nullable()->constrained('media')->nullOnDelete();
        });

        Schema::table('articles', function (Blueprint $table) {
            $table->dropConstrainedForeignId('author_id');
            $table->dropColumn(['content', 'featured_image', 'is_featured']);
        });
    }
};
