<?php

use App\Enums\PageType;
use App\Enums\SectionType;
use App\Models\Page;
use App\Models\PageSection;

function visionPage(): Page
{
    Page::factory()->published()->create(['slug' => 'company', 'page_type' => PageType::Standard]);

    return Page::factory()->published()->create(['slug' => 'company/vision-mission', 'page_type' => PageType::Standard]);
}

function runOperatingValuesMigration(): void
{
    (require database_path('migrations/2026_09_28_000001_add_operating_values_section.php'))->up();
}

test('the migration adds the K.E.N.C.O values under Vision & Mission once', function () {
    $page = visionPage();
    PageSection::factory()->for($page)->create(['section_type' => SectionType::VisionMission, 'sort_order' => 0]);

    runOperatingValuesMigration();
    runOperatingValuesMigration();

    $sections = $page->sections()->orderBy('sort_order')->get();
    $values = $sections->last();

    expect($sections)->toHaveCount(2)
        ->and($values->section_type)->toBe(SectionType::OperatingValues)
        ->and(collect($values->content['items'])->pluck('letter')->implode(''))->toBe('KENCO')
        ->and(collect($values->content['items'])->pluck('title')->all())->toBe(['Keep Safety First', 'Eliminate Waste', 'Never Pass Defect', 'Continuous Improvement', 'Ownership']);
});

test('the company page shows the values in the visitor\'s language with English value titles', function () {
    visionPage();
    runOperatingValuesMigration();

    $this->get('/company')->assertOk()->assertInertia(fn ($page) => $page
        ->where('visionPage.sections.0.section_type', 'operating_values')
        ->where('visionPage.sections.0.content.heading', 'Nilai Operasional')
        ->where('visionPage.sections.0.content.items.0.title', 'Keep Safety First')
        ->where('visionPage.sections.0.content.items.0.description', fn ($text) => str_starts_with($text, 'Menempatkan keselamatan')));

    $this->get('/en/company')->assertOk()->assertInertia(fn ($page) => $page
        ->where('visionPage.sections.0.content.heading', 'Operating Values')
        ->where('visionPage.sections.0.content.items.4.description', fn ($text) => str_starts_with($text, 'Fostering a sense of ownership')));
});

test('admins can pick the section type on any page', function () {
    expect(SectionType::forGenericPage())->toContain(SectionType::OperatingValues);
});
