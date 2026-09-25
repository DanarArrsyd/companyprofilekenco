<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/*
 * Content saved as "published" from an admin form without a publish date was
 * stored with published_at NULL and never appeared publicly. The models now
 * stamp the date on save; this gives existing rows the time they were last
 * saved, which is when the admin meant them to go live.
 */
return new class extends Migration
{
    private const TABLES = [
        'articles', 'capabilities', 'certifications', 'facilities', 'industries',
        'job_vacancies', 'pages', 'products', 'quality_contents',
    ];

    public function up(): void
    {
        foreach (self::TABLES as $table) {
            DB::table($table)
                ->where('status', 'published')
                ->whereNull('published_at')
                ->update(['published_at' => DB::raw('COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)')]);
        }
    }

    public function down(): void
    {
        // Data fix: the original NULLs cannot be told apart afterwards.
    }
};
