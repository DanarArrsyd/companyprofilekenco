<?php

use App\Enums\SectionType;
use App\Models\Media;
use App\Models\Page;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Replaces the two plain-text "Our Vision" / "Our Mission" PageSections
 * (however they currently exist — freshly seeded or admin-edited) with a
 * single structured `vision_mission` section: two admin-replaceable
 * background photos plus the same vision/mission copy, rendered as the new
 * split-card design. A data migration (not a seeder) because it must reach
 * already-deployed environments via the existing `artisan migrate --force`
 * deploy step, without a separate seed run.
 *
 * The two default photos ship in resources/img/ (part of the repo, present
 * on every deploy) and get registered as real Media Library entries here,
 * so they immediately show up as "already uploaded" and are replaceable via
 * the section's own media picker afterwards — not a hardcoded asset path.
 */
return new class extends Migration
{
    private const DEFAULT_VISION = 'To be the most trusted precision manufacturing partner for automotive and industrial customers in Southeast Asia.';

    private const DEFAULT_MISSION = 'We deliver zero-defect components on time, every time, through disciplined process control, continuous improvement, and investment in our people.';

    public function up(): void
    {
        // Only transforms a page that's already there (an existing
        // deployment seeded earlier) — a fresh database (including every
        // test run, which migrates a clean schema with no data) has no
        // 'company/vision-mission' Page yet, so this is a deliberate no-op
        // there. DemoContentSeeder creates the vision_mission section
        // directly on a genuinely fresh install/seed.
        $page = Page::query()->where('slug', 'company/vision-mission')->first();
        if (! $page) {
            return;
        }

        if ($page->sections()->where('section_type', SectionType::VisionMission->value)->exists()) {
            return;
        }

        $existingVision = $page->sections()->where('title', 'Our Vision')->first();
        $existingMission = $page->sections()->where('title', 'Our Mission')->first();

        $visionText = $existingVision?->content['body'] ?? self::DEFAULT_VISION;
        $missionText = $existingMission?->content['body'] ?? self::DEFAULT_MISSION;

        $leftImage = $this->registerDefaultImage('img_visi.png');
        $rightImage = $this->registerDefaultImage('img_misi.png');

        $page->sections()->delete();

        $page->sections()->create([
            'section_type' => SectionType::VisionMission,
            'title' => 'Vision & Mission',
            'content' => [
                'left_image' => $leftImage,
                'right_image' => $rightImage,
                'visi_title' => 'Visi',
                'visi_text' => $visionText,
                'misi_title' => 'Misi',
                'misi_text' => $missionText,
            ],
            'sort_order' => 0,
            'is_active' => true,
        ]);
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

        $section->delete();

        $page->sections()->create([
            'section_type' => SectionType::Text,
            'title' => 'Our Vision',
            'content' => ['body' => self::DEFAULT_VISION],
            'sort_order' => 0,
            'is_active' => true,
        ]);

        $page->sections()->create([
            'section_type' => SectionType::Text,
            'title' => 'Our Mission',
            'content' => ['body' => self::DEFAULT_MISSION],
            'sort_order' => 1,
            'is_active' => true,
        ]);
    }

    /**
     * Copy a default image shipped in resources/img/ into the public Media
     * Library disk under a stable, collision-proof name, and register a
     * Media row for it (if not already registered) so it appears as a
     * normal, replaceable Library entry rather than an opaque asset path.
     */
    private function registerDefaultImage(string $sourceFilename): ?string
    {
        $sourcePath = resource_path("img/{$sourceFilename}");
        if (! File::exists($sourcePath)) {
            return null;
        }

        $storedPath = 'library/'.pathinfo($sourceFilename, PATHINFO_FILENAME).'-'.substr((string) Str::uuid(), 0, 8).'.'.pathinfo($sourceFilename, PATHINFO_EXTENSION);

        if (Media::query()->where('path', $storedPath)->exists()) {
            return $storedPath;
        }

        Storage::disk('public')->put($storedPath, File::get($sourcePath));

        [$width, $height] = @getimagesize($sourcePath) ?: [null, null];

        Media::query()->create([
            'disk' => 'public',
            'path' => $storedPath,
            'filename' => basename($storedPath),
            'original_name' => $sourceFilename,
            'mime_type' => File::mimeType($sourcePath) ?: 'image/png',
            'size' => File::size($sourcePath),
            'width' => $width,
            'height' => $height,
            'alt_text' => null,
            'uploaded_by' => null,
        ]);

        return $storedPath;
    }
};
