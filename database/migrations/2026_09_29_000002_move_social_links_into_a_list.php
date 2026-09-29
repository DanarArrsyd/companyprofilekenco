<?php

use App\Services\SettingsService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Social links became an open list (2026-09-29). The three fixed fields move
 * into it in the order the footer showed them (LinkedIn, Instagram, YouTube);
 * empty ones are dropped and the old rows removed.
 */
return new class extends Migration
{
    private const OLD = ['linkedin' => 'social_linkedin', 'instagram' => 'social_instagram', 'youtube' => 'social_youtube'];

    public function up(): void
    {
        $old = DB::table('site_settings')->whereIn('key', self::OLD)->pluck('value', 'key');
        $current = json_decode((string) DB::table('site_settings')->where('key', 'social_links')->value('value'), true);

        // Only fill a list that is still empty, so running this twice never duplicates or overwrites.
        if (! is_array($current) || $current === []) {
            $links = [];
            foreach (self::OLD as $platform => $key) {
                if (filled($old[$key] ?? null)) {
                    $links[] = ['platform' => $platform, 'url' => $old[$key], 'label' => null];
                }
            }

            app(SettingsService::class)->setMany(['social_links' => $links]);
        }

        DB::table('site_settings')->whereIn('key', self::OLD)->delete();
        app(SettingsService::class)->setMany([]);
    }

    public function down(): void
    {
        // The list stays; the old fixed fields are not recreated.
    }
};
