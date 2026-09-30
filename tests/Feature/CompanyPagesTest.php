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

test('the retired industries page redirects to the company page', function () {
    $response = $this->get('/industries');

    $response->assertRedirect('/company');
});

test('the company page no longer carries industries', function () {
    $this->get('/company')->assertOk()->assertInertia(fn ($page) => $page->missing('industries'));
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

test('industries are dropped from the database and permissions', function () {
    expect(Illuminate\Support\Facades\Schema::hasTable('industries'))->toBeFalse()
        ->and(Spatie\Permission\Models\Permission::where('name', 'like', 'industries.%')->exists())->toBeFalse();
});

test('dropping industries detaches their activity log entries', function () {
    $migration = require database_path('migrations/2026_09_30_000001_drop_industries.php');
    $migration->down();
    $log = App\Models\ActivityLog::create(['action' => 'industry.created', 'subject_type' => 'App\\Models\\Industry', 'subject_id' => 1]);

    $migration->up();

    expect($log->fresh())->subject_type->toBeNull()->subject_id->toBeNull()->action->toBe('industry.created');
});
