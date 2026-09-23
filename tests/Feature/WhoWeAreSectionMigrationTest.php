<?php

use App\Enums\PageType;
use App\Enums\SectionType;
use App\Models\Page;

function whoWeAreLayoutMigration(): object
{
    $paths = glob(database_path('migrations/*_add_taped_image_layout_to_who_we_are.php'));

    expect($paths)->toHaveCount(1);

    return require $paths[0];
}

test('migration adds taped layout and reuses the company hero image', function () {
    $page = Page::factory()->create([
        'slug' => 'company',
        'page_type' => PageType::Standard,
    ]);
    $page->sections()->create([
        'section_type' => SectionType::Hero,
        'title' => 'Company',
        'content' => ['image' => 'library/company-hero.jpg'],
        'sort_order' => 0,
        'is_active' => true,
    ]);
    $section = $page->sections()->create([
        'section_type' => SectionType::Text,
        'title' => 'Who We Are',
        'content' => ['body' => 'Original company copy.'],
        'settings_json' => ['heading_font' => 'caveat'],
        'sort_order' => 1,
        'is_active' => true,
    ]);

    whoWeAreLayoutMigration()->up();

    expect($section->fresh()->content)->toBe([
        'body' => 'Original company copy.',
        'image' => 'library/company-hero.jpg',
    ])->and($section->fresh()->settings_json)->toBe([
        'heading_font' => 'caveat',
        'layout' => 'taped_image',
    ]);
});

test('migration preserves an existing Who We Are image and custom layout', function () {
    $page = Page::factory()->create([
        'slug' => 'company',
        'page_type' => PageType::Standard,
    ]);
    $section = $page->sections()->create([
        'section_type' => SectionType::Text,
        'title' => 'Who We Are',
        'content' => [
            'body' => 'Original company copy.',
            'image' => 'library/custom-company.jpg',
        ],
        'settings_json' => [
            'heading_font' => 'caveat',
            'layout' => 'custom_layout',
        ],
        'sort_order' => 1,
        'is_active' => true,
    ]);

    whoWeAreLayoutMigration()->up();

    expect($section->fresh()->content['image'])->toBe('library/custom-company.jpg')
        ->and($section->fresh()->settings_json['layout'])->toBe('custom_layout');
});

test('migration rollback preserves a taped image layout that may predate the migration', function () {
    $page = Page::factory()->create([
        'slug' => 'company',
        'page_type' => PageType::Standard,
    ]);
    $section = $page->sections()->create([
        'section_type' => SectionType::Text,
        'title' => 'Who We Are',
        'content' => [
            'body' => 'Original company copy.',
            'image' => 'library/company-photo.jpg',
        ],
        'settings_json' => [
            'heading_font' => 'caveat',
            'layout' => 'taped_image',
        ],
        'sort_order' => 1,
        'is_active' => true,
    ]);

    whoWeAreLayoutMigration()->down();

    expect($section->fresh()->content['image'])->toBe('library/company-photo.jpg')
        ->and($section->fresh()->settings_json)->toBe([
            'heading_font' => 'caveat',
            'layout' => 'taped_image',
        ]);
});
