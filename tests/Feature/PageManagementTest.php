<?php

use App\Enums\ContentStatus;
use App\Models\Page;
use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    foreach (['dashboard.view', 'pages.view', 'pages.create', 'pages.update', 'pages.delete'] as $permission) {
        Permission::findOrCreate($permission, 'web');
    }
});

function createPageAdmin(array $permissions): User
{
    $user = User::factory()->create();
    $user->givePermissionTo($permissions);

    return $user;
}

test('authorized admin can view the pages list', function () {
    $user = createPageAdmin(['pages.view']);

    $this->actingAs($user)->get(route('admin.pages'))->assertOk();
});

test('unauthorized user is denied access to the pages list', function () {
    $user = createPageAdmin(['dashboard.view']);

    $this->actingAs($user)->get(route('admin.pages'))->assertForbidden();
});

test('admin can create a page', function () {
    $user = createPageAdmin(['pages.create']);

    $response = $this->actingAs($user)->post(route('admin.pages.store'), [
        'title' => 'About Us',
        'status' => 'draft',
        'seo' => [],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('pages', ['title->en' => 'About Us', 'slug' => 'about-us']);
});

test('admin can update a page', function () {
    $user = createPageAdmin(['pages.create', 'pages.update']);
    $page = Page::factory()->create(['title' => 'Old Title']);

    $response = $this->actingAs($user)->put(route('admin.pages.update', $page), [
        'title' => 'New Title',
        'status' => 'draft',
        'seo' => [],
    ]);

    $response->assertRedirect();
    expect($page->fresh()->title)->toBe('New Title');
});

test('page slug must be unique', function () {
    $user = createPageAdmin(['pages.create']);
    Page::factory()->create(['slug' => 'company']);

    $response = $this->actingAs($user)->post(route('admin.pages.store'), [
        'title' => 'Company Duplicate',
        'slug' => 'company',
        'status' => 'draft',
        'seo' => [],
    ]);

    $response->assertSessionHasErrors('slug');
});

test('draft page is not publicly accessible', function () {
    Page::factory()->create(['slug' => 'draft-page', 'status' => ContentStatus::Draft]);

    $this->get('/draft-page')->assertNotFound();
});

test('published page is publicly accessible', function () {
    Page::factory()->published()->create(['slug' => 'company']);

    $this->get('/company')->assertOk();
});

test('archived page is not publicly accessible', function () {
    Page::factory()->archived()->create(['slug' => 'old-page']);

    $this->get('/old-page')->assertNotFound();
});

test('page with future published_at is not publicly accessible', function () {
    Page::factory()->create([
        'slug' => 'future-page',
        'status' => ContentStatus::Published,
        'published_at' => now()->addWeek(),
    ]);

    $this->get('/future-page')->assertNotFound();
});

test('deleting a page soft deletes it and it can be restored', function () {
    $user = createPageAdmin(['pages.delete']);
    $page = Page::factory()->create();

    $this->actingAs($user)->delete(route('admin.pages.destroy', $page))->assertRedirect();

    $this->assertSoftDeleted('pages', ['id' => $page->id]);

    $this->actingAs($user)->post(route('admin.pages.restore', $page->id))->assertRedirect();

    expect($page->fresh()->trashed())->toBeFalse();
});
