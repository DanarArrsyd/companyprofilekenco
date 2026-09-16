<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certifications', function (Blueprint $table) {
            $table->string('certificate_number')->nullable()->after('issuer');
            $table->string('document_path')->nullable()->after('media_id');
            $table->unsignedInteger('sort_order')->default(0)->after('document_path');
        });
    }

    public function down(): void
    {
        Schema::table('certifications', function (Blueprint $table) {
            $table->dropColumn(['certificate_number', 'document_path', 'sort_order']);
        });
    }
};
