<?php

use App\Enums\PageType;
use App\Enums\SectionType;
use App\Models\Page;
use App\Models\PageSection;

test('the homepage ends after Latest News: career and contact CTAs are switched off, not deleted', function () {
    $home = Page::factory()->published()->create(['page_type' => PageType::Homepage]);
    $other = Page::factory()->published()->create();

    $news = PageSection::factory()->for($home)->create(['section_type' => SectionType::News, 'is_active' => true]);
    $career = PageSection::factory()->for($home)->create(['section_type' => SectionType::CareerCta, 'is_active' => true]);
    $contact = PageSection::factory()->for($home)->create(['section_type' => SectionType::ContactCta, 'is_active' => true]);
    $elsewhere = PageSection::factory()->for($other)->create(['section_type' => SectionType::ContactCta, 'is_active' => true]);

    (require database_path('migrations/2026_09_26_000002_hide_homepage_closing_ctas.php'))->up();

    expect($career->fresh()->is_active)->toBeFalse()
        ->and($contact->fresh()->is_active)->toBeFalse()
        ->and($news->fresh()->is_active)->toBeTrue()
        ->and($elsewhere->fresh()->is_active)->toBeTrue();

    $this->get('/')->assertInertia(fn ($page) => $page
        ->where('sections', fn ($sections) => collect($sections)->pluck('section_type')->intersect(['career_cta', 'contact_cta'])->isEmpty()));
});
