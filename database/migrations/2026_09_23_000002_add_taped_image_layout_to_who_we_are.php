<?php

use App\Enums\SectionType;
use App\Models\Page;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $page = Page::query()
            ->where('slug', 'company')
            ->first();

        if (! $page) {
            return;
        }

        $section = $page->sections()
            ->where('section_type', SectionType::Text->value)
            ->where('title', 'Who We Are')
            ->first();

        if (! $section) {
            return;
        }

        $content = $section->content ?? [];
        $settings = $section->settings_json ?? [];

        if (! array_key_exists('image', $content)) {
            $hero = $page->sections()
                ->where('section_type', SectionType::Hero->value)
                ->first();
            $heroImage = data_get($hero?->content, 'image');

            if (is_string($heroImage) && trim($heroImage) !== '') {
                $content['image'] = $heroImage;
            }
        }

        if (! array_key_exists('layout', $settings)) {
            $settings['layout'] = 'taped_image';
        }

        $section->updateQuietly([
            'content' => $content,
            'settings_json' => $settings,
        ]);
    }

    public function down(): void
    {
        // No rollback mutation: without provenance we cannot distinguish the
        // migration default from an editor's pre-existing CMS choice.
    }
};
