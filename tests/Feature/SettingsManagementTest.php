<?php

use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
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

test('public pages link the favicon uploaded in settings', function () {
    app(SettingsService::class)->setMany(['favicon' => 'settings/icon.png', 'logo' => 'settings/logo.webp']);

    $this->get('/')
        ->assertOk()
        ->assertSee('<link rel="icon" type="image/png" href="/storage/settings/icon.png">', false);

    $this->get('/favicon.ico')->assertRedirect('/storage/settings/icon.png');
});

test('the logo stands in for a missing favicon and nothing is linked without either', function () {
    app(SettingsService::class)->setMany(['logo' => 'settings/logo.webp']);

    $this->get('/')->assertSee('<link rel="icon" type="image/webp" href="/storage/settings/logo.webp">', false);

    app(SettingsService::class)->setMany(['logo' => null]);

    $this->get('/')->assertDontSee('rel="icon"', false);
    $this->get('/favicon.ico')->assertNotFound();
});

test('an ICO favicon upload is accepted and stored without conversion', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $user->givePermissionTo('settings.manage');

    // Minimal valid ICO: 6-byte header + one 16-byte directory entry pointing at a 1x1 PNG.
    $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    $ico = pack('vvv', 0, 1, 1).pack('CCCCvvVV', 1, 1, 0, 0, 1, 32, strlen($png), 22).$png;
    $file = realUpload('icon.ico', $ico);

    $this->actingAs($user)->put(route('admin.settings.update'), ['favicon' => $file])
        ->assertSessionHasNoErrors();

    $path = app(SettingsService::class)->get('favicon');
    expect($path)->toEndWith('.ico');
    Storage::disk('public')->assertExists($path);
    expect(Storage::disk('public')->get($path))->toBe($ico);
});

test('a PNG favicon keeps its original format', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $user->givePermissionTo('settings.manage');

    $this->actingAs($user)->put(route('admin.settings.update'), [
        'favicon' => UploadedFile::fake()->image('icon.png', 64, 64),
    ])->assertSessionHasNoErrors();

    expect(app(SettingsService::class)->get('favicon'))->toEndWith('.png');
});

test('a non-image renamed to .ico is rejected as a favicon', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('settings.manage');

    $file = realUpload('icon.ico', '<script>alert(1)</script>');

    $this->actingAs($user)->put(route('admin.settings.update'), ['favicon' => $file])
        ->assertSessionHasErrors('favicon');
});

/** A real upload (not UploadedFile::fake()), so the MIME type is sniffed from the bytes. */
function realUpload(string $name, string $content): UploadedFile
{
    $path = tempnam(sys_get_temp_dir(), 'upload');
    file_put_contents($path, $content);

    return new UploadedFile($path, $name, null, null, true);
}
