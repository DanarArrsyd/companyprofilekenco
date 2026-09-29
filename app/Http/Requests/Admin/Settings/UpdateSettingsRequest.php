<?php

namespace App\Http\Requests\Admin\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSettingsRequest extends FormRequest
{
    public const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    /** Keep in sync with SOCIAL_PLATFORMS in resources/js/lib/social-links.ts (tests/js/social-links.test.ts). */
    public const SOCIAL_PLATFORMS = ['linkedin', 'instagram', 'youtube', 'facebook', 'tiktok', 'x', 'whatsapp', 'threads', 'other'];

    /**
     * The settings page posts FormData, which cannot carry an empty list: with
     * `<list>_sent`, a missing list means "no rows left".
     */
    protected function prepareForValidation(): void
    {
        foreach (['operating_hours', 'social_links'] as $list) {
            if ($this->boolean("{$list}_sent")) {
                $this->merge([$list => $this->input($list, [])]);
            }
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name' => ['nullable', 'string', 'max:255'],
            'legal_name' => ['nullable', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'company_description' => ['nullable', 'string', 'max:2000'],

            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'logo_path' => ['nullable', 'string', 'max:255'],
            // No 'image' rule: Laravel's image rule rejects .ico. mimes checks
            // the sniffed content, so a renamed non-image still fails.
            'favicon' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,ico', 'max:512'],

            'address' => ['nullable', 'string', 'max:1000'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            // A schedule of rows: day range + opening and closing time (24-hour HH:MM).
            'operating_hours' => ['sometimes', 'array', 'max:7'],
            'operating_hours.*.from' => ['required', Rule::in(self::DAYS)],
            'operating_hours.*.to' => ['required', Rule::in(self::DAYS), function (string $attribute, mixed $value, \Closure $fail) {
                $from = $this->input(str_replace('.to', '.from', $attribute));
                if (in_array($from, self::DAYS, true) && array_search($value, self::DAYS, true) < array_search($from, self::DAYS, true)) {
                    $fail('Hari selesai harus sama dengan atau sesudah hari mulai.');
                }
            }],
            'operating_hours.*.open' => ['required', 'date_format:H:i'],
            'operating_hours.*.close' => ['required', 'date_format:H:i', function (string $attribute, mixed $value, \Closure $fail) {
                $open = $this->input(str_replace('.close', '.open', $attribute));
                if (is_string($open) && is_string($value) && $value <= $open) {
                    $fail('Jam tutup harus sesudah jam buka.');
                }
            }],
            'map_embed_url' => ['nullable', 'url', 'max:1000'],

            // Social links in footer order; `other` is any site, named by its label.
            'social_links' => ['sometimes', 'array', 'max:12'],
            'social_links.*.platform' => ['required', Rule::in(self::SOCIAL_PLATFORMS)],
            'social_links.*.url' => ['required', 'url:http,https', 'max:255'],
            'social_links.*.label' => ['nullable', 'required_if:social_links.*.platform,other', 'string', 'max:50'],

            'seo_default_meta_title' => ['nullable', 'string', 'max:70'],
            'seo_default_meta_description' => ['nullable', 'string', 'max:160'],
            'seo_default_og_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'seo_default_og_image_path' => ['nullable', 'string', 'max:255'],
            'seo_title_separator' => ['nullable', 'string', 'max:5'],
            'seo_default_robots' => ['nullable', Rule::in(['index,follow', 'noindex,follow', 'noindex,nofollow'])],
            'seo_twitter_card_type' => ['nullable', Rule::in(['summary_large_image', 'summary'])],
            'seo_twitter_username' => ['nullable', 'string', 'max:50'],

            'maintenance_mode' => ['boolean'],
        ];
    }
}
