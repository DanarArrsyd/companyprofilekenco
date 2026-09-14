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
        ->component('public/Page')
        ->has('page.sections', 1)
        ->where('page.sections.0.title', 'Visible Section')
    );
});
