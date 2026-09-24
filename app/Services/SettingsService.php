<?php

namespace App\Services;

use App\Models\SiteSetting;
use Illuminate\Support\Facades\Cache;

/**
 * Thin key/value settings store backed by the site_settings table, cached
 * as a single array so reading settings anywhere (public pages included)
 * costs one cache hit instead of a query per key.
 */
class SettingsService
{
    private const CACHE_KEY = 'site_settings.all';

    /**
     * Known setting keys grouped for the admin Settings UI, with their
     * value type ('string', 'text', 'bool', or 'image').
     */
    public const GROUPS = [
        'general' => [
            'company_name' => 'string',
            'legal_name' => 'string',
            'tagline' => 'string',
            'company_description' => 'text',
        ],
        'branding' => [
            'logo' => 'image',
            'favicon' => 'image',
        ],
        'contact' => [
            'address' => 'text',
            'phone' => 'string',
            'email' => 'string',
            'operating_hours' => 'string',
            'map_embed_url' => 'string',
        ],
        'social' => [
            'social_linkedin' => 'string',
            'social_youtube' => 'string',
            'social_instagram' => 'string',
        ],
        'seo' => [
            'seo_default_meta_title' => 'string',
            'seo_default_meta_description' => 'text',
            'seo_default_og_image' => 'image',
            'seo_title_separator' => 'string',
            'seo_default_robots' => 'string',
            'seo_twitter_card_type' => 'string',
            'seo_twitter_username' => 'string',
        ],
        'system' => [
            'maintenance_mode' => 'bool',
            'show_language_switcher' => 'bool',
        ],
    ];

    public function all(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            $rows = SiteSetting::all()->keyBy('key');
            $values = [];

            foreach (self::GROUPS as $group) {
                foreach ($group as $key => $type) {
                    $values[$key] = $this->cast($rows->get($key)?->value, $type);
                }
            }

            return $values;
        });
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->all()[$key] ?? $default;
    }

    /**
     * Persist a batch of key => value pairs known to the settings groups
     * and invalidate the cache once, atomically for the whole request.
     */
    public function setMany(array $pairs): void
    {
        $types = collect(self::GROUPS)->collapse();

        foreach ($pairs as $key => $value) {
            if (! $types->has($key)) {
                continue;
            }

            SiteSetting::updateOrCreate(
                ['key' => $key],
                ['value' => is_bool($value) ? ($value ? '1' : '0') : $value, 'type' => $types->get($key)],
            );
        }

        Cache::forget(self::CACHE_KEY);
    }

    private function cast(?string $value, string $type): mixed
    {
        return match ($type) {
            'bool' => (bool) $value,
            default => $value,
        };
    }
}
