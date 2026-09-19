<?php

use App\Enums\SectionType;
use App\Models\Page;
use Illuminate\Database\Migrations\Migration;

/**
 * The vision_mission section's card titles were seeded as the Indonesian
 * short forms "Visi"/"Misi" — product direction changed to the English
 * "Vision"/"Mission" (uppercase in the UI via CSS, but the stored value
 * itself should read as the real word, not just capitalized Indonesian).
 * Only touches rows still holding the old default; an admin-edited title
 * is left alone.
 */
return new class extends Migration
{
    public function up(): void
    {
        $page = Page::query()->where('slug', 'company/vision-mission')->first();
        if (! $page) {
            return;
        }

        $section = $page->sections()->where('section_type', SectionType::VisionMission->value)->first();
        if (! $section) {
            return;
        }

        $content = $section->content ?? [];

        if (($content['visi_title'] ?? null) === 'Visi') {
            $content['visi_title'] = 'Vision';
        }

        if (($content['misi_title'] ?? null) === 'Misi') {
            $content['misi_title'] = 'Mission';
        }

        $section->update(['content' => $content]);
    }

    public function down(): void
    {
        $page = Page::query()->where('slug', 'company/vision-mission')->first();
        if (! $page) {
            return;
        }

        $section = $page->sections()->where('section_type', SectionType::VisionMission->value)->first();
        if (! $section) {
            return;
        }

        $content = $section->content ?? [];

        if (($content['visi_title'] ?? null) === 'Vision') {
            $content['visi_title'] = 'Visi';
        }

        if (($content['misi_title'] ?? null) === 'Mission') {
            $content['misi_title'] = 'Misi';
        }

        $section->update(['content' => $content]);
    }
};
