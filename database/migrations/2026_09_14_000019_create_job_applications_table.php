<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_vacancy_id')->constrained()->cascadeOnDelete();
            $table->string('applicant_name');
            $table->string('applicant_email');
            $table->string('applicant_phone')->nullable();
            $table->text('cover_letter')->nullable();
            $table->string('cv_path');
            $table->string('status')->default('submitted');
            $table->timestamps();

            $table->index(['job_vacancy_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
