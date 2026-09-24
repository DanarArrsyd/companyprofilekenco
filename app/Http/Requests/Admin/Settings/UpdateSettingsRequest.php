<?php

namespace App\Http\Requests\Admin\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSettingsRequest extends FormRequest
{
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
            'operating_hours' => ['nullable', 'string', 'max:255'],
            'map_embed_url' => ['nullable', 'url', 'max:1000'],

            'social_linkedin' => ['nullable', 'url', 'max:255'],
            'social_youtube' => ['nullable', 'url', 'max:255'],
            'social_instagram' => ['nullable', 'url', 'max:255'],

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
