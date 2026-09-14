<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('machines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facility_id')->nullable()->constrained('facilities')->nullOnDelete();
            $table->string('name');
            $table->string('model_number')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('facility_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('machines');
    }
};
