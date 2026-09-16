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
        ->component('public/Page')
        ->has('page.sections', 0)
    );
});

test('vision and mission page never shows regression audit test copy', function () {
    publishedStandardPage('company/vision-mission', 'Vision & Mission');

    $response = $this->get('/company/vision-mission');

    $response->assertOk();
    $response->assertDontSee('Regression audit content');
    $response->assertDontSee('Supporting detail');
});

test('vision and mission page with no content shows only the header, no debug copy', function () {
    publishedStandardPage('company/vision-mission', 'Vision & Mission');

    $response = $this->get('/company/vision-mission');

    $response->assertOk();
    $response->assertDontSee('This page has no content yet');
    $response->assertInertia(fn ($page) => $page
        ->component('public/Page')
        ->has('page.sections', 0)
    );
});

test('company/milestones page has been removed and returns 404', function () {
    $response = $this->get('/company/milestones');

    $response->assertNotFound();
});
