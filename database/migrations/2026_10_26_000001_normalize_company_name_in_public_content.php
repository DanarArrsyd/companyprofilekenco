<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Normalize the company's display name in CMS copy and SEO metadata.
 * Slugs, URLs, email addresses, file paths, and third-party names stay intact.
 */
return new class extends Migration
{
    private const NAME = 'PT Kenco Manufactur Indonesia';

    /** @var array<string, list<string>> */
    private const CONTENT_COLUMNS = [
        'pages' => ['title'],
        'page_sections' => ['title', 'subtitle', 'content', 'settings_json'],
        'products' => ['name', 'short_description', 'description', 'material', 'application', 'manufacturing_process'],
        'product_categories' => ['name', 'description'],
        'capabilities' => ['name', 'summary', 'description'],
        'capability_steps' => ['title', 'description'],
        'machines' => ['name', 'description', 'specification'],
        'facilities' => ['name', 'description'],
        'facility_categories' => ['name', 'description'],
        'certifications' => ['name'],
        'quality_contents' => ['title', 'summary', 'content'],
        'news_categories' => ['name', 'description'],
        'articles' => ['title', 'excerpt', 'content'],
        'job_vacancies' => ['title', 'description', 'requirements'],
        'milestones' => ['title', 'description'],
        'seo_metadata' => ['meta_title', 'meta_description', 'og_title', 'og_description', 'schema_json'],
    ];

    /** @var list<string> */
    private const SETTINGS_COPY = [
        'tagline',
        'company_description',
        'seo_default_meta_title',
        'seo_default_meta_description',
    ];

    public function up(): void
    {
        DB::transaction(function (): void {
            foreach (self::CONTENT_COLUMNS as $table => $columns) {
                if (! Schema::hasTable($table)) {
                    continue;
                }

                DB::table($table)
                    ->select(['id', ...$columns])
                    ->orderBy('id')
                    ->chunkById(100, function ($rows) use ($table, $columns): void {
                        foreach ($rows as $row) {
                            $changes = [];

                            foreach ($columns as $column) {
                                $value = $row->{$column};

                                if (! is_string($value)) {
                                    continue;
                                }

                                $normalized = $this->normalize($value);

                                if ($normalized !== $value) {
                                    $changes[$column] = $normalized;
                                }
                            }

                            if ($changes !== []) {
                                DB::table($table)->where('id', $row->id)->update($changes);
                            }
                        }
                    });
            }

            if (! Schema::hasTable('site_settings')) {
                return;
            }

            foreach (self::SETTINGS_COPY as $key) {
                $setting = DB::table('site_settings')->where('key', $key)->first(['id', 'value']);

                if ($setting && is_string($setting->value)) {
                    $normalized = $this->normalize($setting->value);

                    if ($normalized !== $setting->value) {
                        DB::table('site_settings')->where('id', $setting->id)->update(['value' => $normalized]);
                    }
                }
            }

            foreach (['company_name', 'legal_name'] as $key) {
                $setting = DB::table('site_settings')->where('key', $key)->first(['id']);

                if ($setting) {
                    DB::table('site_settings')->where('id', $setting->id)->update(['value' => self::NAME]);
                } else {
                    DB::table('site_settings')->insert([
                        'key' => $key,
                        'value' => self::NAME,
                        'type' => 'string',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        });

        Cache::forget('site_settings.all');
    }

    public function down(): void
    {
        // Original spelling and editorial changes cannot be restored safely.
    }

    private function normalize(string $value): string
    {
        return preg_replace(
            '/(?<![\pL\pN])(?:PT\.?\s+)?Kenco\s+(?:Manufactur(?:ing|e)?|Manufaktur)(?:\s+Indonesia)?(?![\pL\pN])/iu',
            self::NAME,
            $value,
        ) ?? $value;
    }
};
