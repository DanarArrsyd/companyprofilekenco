<?php

use App\Enums\SectionType;
use App\Models\PageSection;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $section = PageSection::query()
            ->where('section_type', SectionType::Text->value)
            ->where('title', 'Who We Are')
            ->whereHas('page', fn ($query) => $query->where('slug', 'company'))
            ->first();

        if (! $section) {
            return;
        }

        $settings = $section->settings_json ?? [];
        if (array_key_exists('heading_font', $settings)) {
            return;
        }

        $settings['heading_font'] = 'caveat';
        $section->updateQuietly(['settings_json' => $settings]);
    }

    public function down(): void
    {
        $section = PageSection::query()
            ->where('section_type', SectionType::Text->value)
            ->where('title', 'Who We Are')
            ->whereHas('page', fn ($query) => $query->where('slug', 'company'))
            ->first();

        if (! $section) {
            return;
        }

        $settings = $section->settings_json ?? [];
        if (($settings['heading_font'] ?? null) !== 'caveat') {
            return;
        }

        unset($settings['heading_font']);
        $section->updateQuietly(['settings_json' => $settings ?: null]);
    }
};
