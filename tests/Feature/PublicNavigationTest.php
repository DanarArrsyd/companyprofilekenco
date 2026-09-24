<?php

use App\Enums\ContentStatus;
use App\Models\Article;
use App\Models\User;
use App\Services\SettingsService;
use Spatie\Permission\Models\Permission;

test('public pages share the two latest published articles for the menu', function () {
    Article::factory()->published()->create(['title' => 'Older', 'slug' => 'older', 'published_at' => now()->subDays(3)]);
    Article::factory()->published()->create(['title' => 'Newest', 'slug' => 'newest', 'published_at' => now()->subHour()]);
    Article::factory()->published()->create(['title' => 'Middle', 'slug' => 'middle', 'published_at' => now()->subDay()]);

    $this->get('/')->assertInertia(fn ($page) => $page
        ->has('menuNews', 2)
        ->where('menuNews.0.slug', 'newest')
        ->where('menuNews.1.slug', 'middle')
    );
});

test('menu news never exposes drafts, archived or scheduled articles', function () {
    Article::factory()->create(['slug' => 'draft', 'status' => ContentStatus::Draft]);
    Article::factory()->archived()->create(['slug' => 'archived']);
    Article::factory()->create(['slug' => 'scheduled', 'status' => ContentStatus::Published, 'published_at' => now()->addDay()]);

    $this->get('/')->assertInertia(fn ($page) => $page->has('menuNews', 0));
});

test('admin pages do not load menu news', function () {
    Permission::findOrCreate('settings.manage', 'web');
    $user = User::factory()->create();
    $user->givePermissionTo('settings.manage');
    Article::factory()->published()->create();

    $this->actingAs($user)
        ->get(route('admin.settings'))
        ->assertInertia(fn ($page) => $page->where('menuNews', []));
});

test('language switcher is hidden until enabled in settings', function () {
    $this->get('/')->assertInertia(fn ($page) => $page->where('siteSettings.show_language_switcher', false));

    app(SettingsService::class)->setMany(['show_language_switcher' => true]);

    $this->get('/')->assertInertia(fn ($page) => $page->where('siteSettings.show_language_switcher', true));
});

test('admins can toggle the language switcher', function () {
    Permission::findOrCreate('settings.manage', 'web');
    $user = User::factory()->create();
    $user->givePermissionTo('settings.manage');

    $this->actingAs($user)
        ->put(route('admin.settings.update'), ['show_language_switcher' => true])
        ->assertRedirect();

    expect(app(SettingsService::class)->get('show_language_switcher'))->toBeTrue();
});
