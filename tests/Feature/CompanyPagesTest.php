<?php

use App\Enums\ContentStatus;
use App\Enums\PageType;
use App\Enums\SectionType;
use App\Models\Page;

function publishedStandardPage(string $slug, string $title): Page
{
    return Page::factory()->create([
        'slug' => $slug,
        'title' => $title,
        'page_type' => PageType::Standard,
        'status' => ContentStatus::Published,
        'published_at' => now()->subDay(),
    ]);
}

test('company page never shows regression audit test copy', function () {
    $page = publishedStandardPage('company', 'Company');
    $page->sections()->create([
        'section_type' => SectionType::Text,
        'title' => 'Our Story',
        'subtitle' => 'A real production sentence about the company.',
        'content' => [],
        'sort_order' => 0,
        'is_active' => true,
    ]);

    $response = $this->get('/company');

    $response->assertOk();
    $response->assertDontSee('Regression audit content');
    $response->assertDontSee('Supporting detail');
    $response->assertDontSee('confirm the image_text section type');
});

test('company page with no real content renders a clean header only, no debug copy', function () {
    publishedStandardPage('company', 'Company');

    $response = $this->get('/company');

    $response->assertOk();
    $response->assertDontSee('Regression audit content');
    $response->assertDontSee('This page has no content yet');
    $response->assertInertia(fn ($page) => $page
        ->component('public/company/Index')
        ->has('aboutPage.sections', 0)
    );
});

test('vision and mission content is rendered as a section of the merged company page', function () {
    publishedStandardPage('company/vision-mission', 'Vision & Mission');
    $page = Page::query()->where('slug', 'company/vision-mission')->firstOrFail();
    $page->sections()->create([
        'section_type' => SectionType::Text,
        'title' => 'Our Story',
        'subtitle' => 'A real production sentence about vision and mission.',
        'content' => [],
        'sort_order' => 0,
        'is_active' => true,
    ]);

    $response = $this->get('/company');

    $response->assertOk();
    $response->assertSee('A real production sentence about vision and mission.');
    $response->assertDontSee('Regression audit content');
});

test('company/vision-mission redirects to the merged company page anchor', function () {
    $response = $this->get('/company/vision-mission');

    $response->assertRedirect('/company#vision-mission');
});

test('facilities redirects to the merged company page anchor', function () {
    $response = $this->get('/facilities');

    $response->assertRedirect('/company#facilities');
});

test('industries redirects to the merged company page anchor', function () {
    $response = $this->get('/industries');

    $response->assertRedirect('/company#industries');
});

test('company/milestones page has been removed and returns 404', function () {
    $response = $this->get('/company/milestones');

    $response->assertNotFound();
});

test('company page renders its header shell with no 404 when no Page records exist yet', function () {
    $response = $this->get('/company');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/company/Index')
        ->where('aboutPage', null)
        ->where('visionPage', null)
    );
});
