<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('capability_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('capability_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->index(['capability_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('capability_steps');
    }
};
