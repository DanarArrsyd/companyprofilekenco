<?php

use App\Enums\ContentStatus;
use App\Models\Page;
use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Permission::findOrCreate('pages.view', 'web');
});

test('admin can preview a draft page', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('pages.view');

    $page = Page::factory()->create(['status' => ContentStatus::Draft]);

    $response = $this->actingAs($user)->get(route('admin.pages.preview', $page));

    $response->assertOk();
    $response->assertInertia(fn ($assert) => $assert
        ->component('public/Page')
        ->where('preview', true)
        ->where('seo.robots_index', false)
    );
});

test('draft page cannot be accessed via the normal public route', function () {
    $page = Page::factory()->create(['slug' => 'secret-draft', 'status' => ContentStatus::Draft]);

    $this->get('/secret-draft')->assertNotFound();
});

test('guest is redirected to login when attempting to preview a page', function () {
    $page = Page::factory()->create();

    $this->get(route('admin.pages.preview', $page))->assertRedirect('/admin/login');
});
