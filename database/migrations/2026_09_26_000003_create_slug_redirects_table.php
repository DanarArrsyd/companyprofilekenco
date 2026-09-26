<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Old slugs of content with a public detail page, so a renamed product,
 * capability, article or vacancy keeps its old links working (301).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('slug_redirects', function (Blueprint $table) {
            $table->id();
            $table->string('sluggable_type');
            $table->unsignedBigInteger('sluggable_id');
            $table->string('old_slug');
            $table->timestamps();

            $table->unique(['sluggable_type', 'old_slug']);
            $table->index(['sluggable_type', 'sluggable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slug_redirects');
    }
};
