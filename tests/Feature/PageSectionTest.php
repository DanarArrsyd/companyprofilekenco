<?php

use App\Models\Page;
use App\Models\PageSection;
use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    foreach (['pages.view', 'pages.update'] as $permission) {
        Permission::findOrCreate($permission, 'web');
    }
});

test('a page can have multiple sections', function () {
    $page = Page::factory()->create();
    PageSection::factory()->count(3)->create(['page_id' => $page->id]);

    expect($page->sections)->toHaveCount(3);
});

test('sections can be reordered', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('pages.update');

    $page = Page::factory()->create();
    $first = PageSection::factory()->create(['page_id' => $page->id, 'sort_order' => 0]);
    $second = PageSection::factory()->create(['page_id' => $page->id, 'sort_order' => 1]);

    $this->actingAs($user)->post(route('admin.pages.sections.reorder', $page), [
        'ordered_ids' => [$second->id, $first->id],
    ])->assertRedirect();

    expect($second->fresh()->sort_order)->toBe(0)
        ->and($first->fresh()->sort_order)->toBe(1);
});

test('inactive sections are not rendered on the public page', function () {
    $page = Page::factory()->published()->create(['slug' => 'company']);
    PageSection::factory()->create([
        'page_id' => $page->id,
        'section_type' => 'text',
        'title' => 'Visible Section',
        'is_active' => true,
    ]);
    PageSection::factory()->create([
        'page_id' => $page->id,
        'section_type' => 'text',
        'title' => 'Hidden Section',
        'is_active' => false,
    ]);

    $response = $this->get('/company');

    $response->assertInertia(fn ($assert) => $assert
        ->component('public/company/Index')
        ->has('aboutPage.sections', 1)
        ->where('aboutPage.sections.0.title', 'Visible Section')
    );
});

test('a section cta url accepts an internal relative path', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('pages.update');

    $page = Page::factory()->create();
    $section = PageSection::factory()->create(['page_id' => $page->id]);

    $this->actingAs($user)->put(route('admin.pages.sections.update', [$page, $section]), [
        'section_type' => $section->section_type->value,
        'content' => [
            'primary_cta_url' => '/capabilities',
            'secondary_cta_url' => '/contact',
        ],
        'is_active' => true,
    ])->assertRedirect();

    expect($section->fresh()->content['primary_cta_url'])->toBe('/capabilities')
        ->and($section->fresh()->content['secondary_cta_url'])->toBe('/contact');
});

test('a section cta url still accepts a full external url', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('pages.update');

    $page = Page::factory()->create();
    $section = PageSection::factory()->create(['page_id' => $page->id]);

    $this->actingAs($user)->put(route('admin.pages.sections.update', [$page, $section]), [
        'section_type' => $section->section_type->value,
        'content' => [
            'primary_cta_url' => 'https://example.com/partners',
        ],
        'is_active' => true,
    ])->assertRedirect();

    expect($section->fresh()->content['primary_cta_url'])->toBe('https://example.com/partners');
});

test('a section cta url rejects a malformed value', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('pages.update');

    $page = Page::factory()->create();
    $section = PageSection::factory()->create(['page_id' => $page->id]);

    $this->actingAs($user)->put(route('admin.pages.sections.update', [$page, $section]), [
        'section_type' => $section->section_type->value,
        'content' => [
            'primary_cta_url' => 'not a url',
        ],
        'is_active' => true,
    ])->assertSessionHasErrors('content.primary_cta_url');
});

test('saving a section keeps content keys that have no dedicated validation rule', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('pages.update');

    $page = Page::factory()->create();
    $section = PageSection::factory()->create(['page_id' => $page->id]);

    $this->actingAs($user)->put(route('admin.pages.sections.update', [$page, $section]), [
        'section_type' => $section->section_type->value,
        'content' => [
            'eyebrow' => 'Since 2005',
            'heading' => 'Precision Manufacturing, Built to Last',
            'description' => 'We engineer and manufacture stamped metal parts.',
            'image' => 'media/hero.png',
            'primary_cta_label' => 'Our Capabilities',
            'primary_cta_url' => '/capabilities',
        ],
        'is_active' => true,
    ])->assertRedirect();

    $content = $section->fresh()->content;

    expect($content['eyebrow'])->toBe('Since 2005')
        ->and($content['heading'])->toBe('Precision Manufacturing, Built to Last')
        ->and($content['description'])->toBe('We engineer and manufacture stamped metal parts.')
        ->and($content['image'])->toBe('media/hero.png')
        ->and($content['primary_cta_label'])->toBe('Our Capabilities')
        ->and($content['primary_cta_url'])->toBe('/capabilities');
});
