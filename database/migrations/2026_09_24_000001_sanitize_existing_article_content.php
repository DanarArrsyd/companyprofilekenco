<?php

use App\Services\RichTextSanitizer;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Article content is now sanitized on write (Article::content mutator).
 * Rows saved before that went in unfiltered, so clean them once with the
 * same allowlist. Uses the query builder to avoid touching updated_at,
 * soft-delete scopes or activity logs.
 */
return new class extends Migration
{
    public function up(): void
    {
        $sanitizer = app(RichTextSanitizer::class);

        DB::table('articles')
            ->whereNotNull('content')
            ->orderBy('id')
            ->chunkById(100, function ($articles) use ($sanitizer) {
                foreach ($articles as $article) {
                    $clean = $sanitizer->sanitize($article->content);

                    if ($clean !== $article->content) {
                        DB::table('articles')->where('id', $article->id)->update(['content' => $clean]);
                    }
                }
            });
    }

    public function down(): void
    {
        // Irreversible by design: stripped markup is not restorable.
    }
};
