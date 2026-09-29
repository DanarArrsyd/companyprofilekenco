<?php

use App\Models\SiteSetting;
use App\Models\User;
use App\Services\SettingsService;
use Spatie\Permission\Models\Permission;

function socialAdmin(): User
{
    Permission::findOrCreate('settings.manage', 'web');

    return tap(User::factory()->create())->givePermissionTo('settings.manage');
}

test('any number of social links is saved in order and shared with public pages', function () {
    $links = [
        ['platform' => 'linkedin', 'url' => 'https://www.linkedin.com/company/kenco', 'label' => null],
        ['platform' => 'whatsapp', 'url' => 'https://wa.me/6281234567890', 'label' => null],
        ['platform' => 'tiktok', 'url' => 'https://www.tiktok.com/@kenco', 'label' => null],
        ['platform' => 'facebook', 'url' => 'https://www.facebook.com/kenco', 'label' => null],
        ['platform' => 'other', 'url' => 'https://kenco.example/katalog', 'label' => 'Katalog'],
    ];

    $this->actingAs(socialAdmin())
        ->put(route('admin.settings.update'), ['social_links' => $links, 'social_links_sent' => '1'])
        ->assertSessionHasNoErrors();

    expect(app(SettingsService::class)->get('social_links'))->toBe($links);

    $this->get('/')->assertInertia(fn ($page) => $page->where('siteSettings.social_links', $links));
});

test('an unknown platform, a bad url or an unnamed custom link is rejected', function () {
    $this->actingAs(socialAdmin())
        ->put(route('admin.settings.update'), ['social_links_sent' => '1', 'social_links' => [
            ['platform' => 'myspace', 'url' => 'https://myspace.com/kenco'],
            ['platform' => 'instagram', 'url' => 'not a url'],
            ['platform' => 'other', 'url' => 'https://kenco.example'],
        ]])
        ->assertSessionHasErrors(['social_links.0.platform', 'social_links.1.url', 'social_links.2.label']);
});

test('removing every link clears them; omitting the list keeps them', function () {
    app(SettingsService::class)->setMany(['social_links' => [['platform' => 'youtube', 'url' => 'https://youtube.com/@kenco', 'label' => null]]]);

    $this->actingAs(socialAdmin())->put(route('admin.settings.update'), ['company_name' => 'Kenco']);
    expect(app(SettingsService::class)->get('social_links'))->toHaveCount(1);

    $this->actingAs(socialAdmin())->put(route('admin.settings.update'), ['social_links_sent' => '1']);
    expect(app(SettingsService::class)->get('social_links'))->toBe([]);
});

test('the three old fields move into the list in their footer order', function () {
    foreach (['social_linkedin' => 'https://www.linkedin.com/company/kenco', 'social_youtube' => '', 'social_instagram' => 'https://instagram.com/kenco'] as $key => $value) {
        SiteSetting::updateOrCreate(['key' => $key], ['value' => $value, 'type' => 'string']);
    }

    (require database_path('migrations/2026_09_29_000002_move_social_links_into_a_list.php'))->up();

    expect(app(SettingsService::class)->get('social_links'))->toBe([
        ['platform' => 'linkedin', 'url' => 'https://www.linkedin.com/company/kenco', 'label' => null],
        ['platform' => 'instagram', 'url' => 'https://instagram.com/kenco', 'label' => null],
    ])->and(SiteSetting::where('key', 'like', 'social\_%')->where('key', '!=', 'social_links')->count())->toBe(0);
});

test('every social link feeds the organisation structured data', function () {
    app(SettingsService::class)->setMany(['social_links' => [
        ['platform' => 'linkedin', 'url' => 'https://www.linkedin.com/company/kenco', 'label' => null],
        ['platform' => 'tiktok', 'url' => 'https://www.tiktok.com/@kenco', 'label' => null],
    ]]);

    $this->get('/')->assertInertia(fn ($page) => $page->where('schema.0.sameAs', ['https://www.linkedin.com/company/kenco', 'https://www.tiktok.com/@kenco']));
});
