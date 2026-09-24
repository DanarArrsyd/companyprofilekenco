<?php

use App\Models\Page;
use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    foreach (['pages.create', 'pages.update'] as $permission) {
        Permission::findOrCreate($permission, 'web');
    }
});

test('creating a page creates its polymorphic seo metadata', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('pages.create');

    $this->actingAs($user)->post(route('admin.pages.store'), [
        'title' => 'Vision & Mission',
        'status' => 'draft',
        'seo' => ['meta_title' => 'Our Vision'],
    ]);

    $page = Page::where('title->en', 'Vision & Mission')->firstOrFail();

    expect($page->seoMetadata)->not->toBeNull()
        ->and($page->seoMetadata->meta_title)->toBe('Our Vision')
        ->and($page->seoMetadata->seoable_type)->toBe($page->getMorphClass())
        ->and($page->seoMetadata->seoable_id)->toBe($page->id);
});

test('page seo metadata can be updated', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('pages.update');

    $page = Page::factory()->create();
    $page->seoMetadata()->create(['meta_title' => 'Old Title']);

    $this->actingAs($user)->put(route('admin.pages.update', $page), [
        'title' => $page->title,
        'status' => 'draft',
        'seo' => ['meta_title' => 'Updated Title'],
    ]);

    expect($page->seoMetadata()->first()->meta_title)->toBe('Updated Title');
});
