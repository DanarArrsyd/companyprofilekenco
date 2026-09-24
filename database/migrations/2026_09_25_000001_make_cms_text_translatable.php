<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * CMS text becomes translatable (spatie/laravel-translatable): each column
 * stores {"en": "...", "id": "..."}. Existing single-language values are the
 * English originals, so they are wrapped as {"en": value}. VARCHAR columns
 * widen to TEXT first so the JSON wrapper can never truncate a 255-char
 * value. Idempotent: rows already holding a locale map are left alone.
 */
return new class extends Migration
{
    /** @var array<string, list<string>> */
    private const COLUMNS = [
        'articles' => ['title', 'excerpt', 'content'],
        'capabilities' => ['name', 'summary', 'description'],
        'capability_steps' => ['title', 'description'],
        'facilities' => ['name', 'description'],
        'facility_categories' => ['name', 'description'],
        'industries' => ['name', 'description'],
        'job_vacancies' => ['title', 'description', 'requirements'],
        'milestones' => ['title', 'description'],
        'news_categories' => ['name', 'description'],
        'pages' => ['title'],
        'page_sections' => ['title', 'subtitle'],
        'products' => ['short_description', 'description', 'material', 'application', 'manufacturing_process'],
        'product_categories' => ['name', 'description'],
        'quality_contents' => ['title', 'summary', 'content'],
        'seo_metadata' => ['meta_title', 'meta_description', 'og_title', 'og_description'],
        'statistics' => ['label'],
    ];

    public function up(): void
    {
        foreach (self::COLUMNS as $table => $columns) {
            $this->widenToText($table, $columns);

            $this->rewrite($table, $columns, function (string $value): ?string {
                return $this->isLocaleMap($value) ? null : json_encode(['en' => $value], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            });
        }
    }

    public function down(): void
    {
        // Keep the wider TEXT columns; only unwrap back to the English text.
        foreach (self::COLUMNS as $table => $columns) {
            $this->rewrite($table, $columns, function (string $value): ?string {
                if (! $this->isLocaleMap($value)) {
                    return null;
                }

                $map = json_decode($value, true);

                return (string) ($map['en'] ?? reset($map) ?? '');
            });
        }
    }

    /** @param  list<string>  $columns */
    private function widenToText(string $table, array $columns): void
    {
        $existing = collect(Schema::getColumns($table))->keyBy('name');

        $toWiden = array_filter($columns, fn (string $column) => in_array(
            strtolower((string) ($existing[$column]['type_name'] ?? '')),
            ['varchar', 'char', 'string'],
            true,
        ));

        if ($toWiden === []) {
            return;
        }

        Schema::table($table, function (Blueprint $blueprint) use ($toWiden, $existing) {
            foreach ($toWiden as $column) {
                $blueprint->text($column)->nullable((bool) $existing[$column]['nullable'])->change();
            }
        });
    }

    /**
     * @param  list<string>  $columns
     * @param  callable(string): ?string  $transform  Returns the new value, or null to leave the cell unchanged.
     */
    private function rewrite(string $table, array $columns, callable $transform): void
    {
        DB::table($table)->orderBy('id')->chunkById(200, function ($rows) use ($table, $columns, $transform) {
            foreach ($rows as $row) {
                $changes = [];

                foreach ($columns as $column) {
                    $value = $row->{$column} ?? null;

                    if ($value === null || $value === '') {
                        continue;
                    }

                    $next = $transform((string) $value);

                    if ($next !== null) {
                        $changes[$column] = $next;
                    }
                }

                if ($changes !== []) {
                    DB::table($table)->where('id', $row->id)->update($changes);
                }
            }
        });
    }

    private function isLocaleMap(string $value): bool
    {
        if (! str_starts_with(ltrim($value), '{')) {
            return false;
        }

        $decoded = json_decode($value, true);

        return is_array($decoded) && $decoded !== [] && array_diff(array_keys($decoded), ['en', 'id']) === [];
    }
};
