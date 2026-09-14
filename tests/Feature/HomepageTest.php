<?php

use App\Enums\PageType;
use App\Models\Page;
use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Permission::findOrCreate('pages.view', 'web');
});

test('homepage editor provisions the singleton page and its fixed sections', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('pages.view');

    $this->actingAs($user)->get(route('admin.homepage'))->assertOk();

    $page = Page::where('page_type', PageType::Homepage)->first();

    expect($page)->not->toBeNull()
        ->and($page->sections)->toHaveCount(10);
});

test('public homepage reads structured content without erroring', function () {
    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn ($assert) => $assert->component('public/Home'));
});

test('empty related modules do not break the public homepage', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('pages.view');
    $this->actingAs($user)->get(route('admin.homepage'));

    $page = Page::where('page_type', PageType::Homepage)->firstOrFail();
    $page->update(['status' => \App\Enums\ContentStatus::Published, 'published_at' => now()->subDay()]);

    $capabilitiesSection = $page->sections()->where('section_type', 'capabilities')->first();
    $capabilitiesSection->update(['content' => ['capability_ids' => [999999]], 'is_active' => true]);

    $response = $this->get('/');

    $response->assertOk();
});
