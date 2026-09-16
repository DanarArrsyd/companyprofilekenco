<?php

use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Permission::findOrCreate('settings.manage', 'web');
});

test('authorized admin can update settings', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('settings.manage');

    $response = $this->actingAs($user)->put(route('admin.settings.update'), [
        'company_name' => 'PT. Kenco Manufactur Indonesia',
        'email' => 'hello@kenco.test',
        'maintenance_mode' => false,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('site_settings', ['key' => 'company_name', 'value' => 'PT. Kenco Manufactur Indonesia']);
});

test('unauthorized user cannot update settings', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->put(route('admin.settings.update'), ['company_name' => 'Hack'])->assertForbidden();
});

test('settings cache is invalidated after an update', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('settings.manage');

    app(SettingsService::class)->all();
    expect(Cache::has('site_settings.all'))->toBeTrue();

    $this->actingAs($user)->put(route('admin.settings.update'), ['company_name' => 'New Name']);

    expect(app(SettingsService::class)->get('company_name'))->toBe('New Name');
});

test('public pages fall back to app name when company_name is not set', function () {
    $response = $this->get('/');

    $response->assertInertia(fn ($page) => $page->where('siteSettings.company_name', config('app.name')));
});

test('public pages render settings once configured', function () {
    app(SettingsService::class)->setMany(['company_name' => 'Kenco Public Name']);

    $response = $this->get('/');

    $response->assertInertia(fn ($page) => $page->where('siteSettings.company_name', 'Kenco Public Name'));
});

test('invalid email is rejected', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('settings.manage');

    $response = $this->actingAs($user)->put(route('admin.settings.update'), ['email' => 'not-an-email']);

    $response->assertSessionHasErrors('email');
});
