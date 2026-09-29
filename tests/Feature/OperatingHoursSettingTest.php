<?php

use App\Models\SiteSetting;
use App\Models\User;
use App\Services\SettingsService;
use Spatie\Permission\Models\Permission;

function hoursAdmin(): User
{
    Permission::findOrCreate('settings.manage', 'web');

    return tap(User::factory()->create())->givePermissionTo('settings.manage');
}

$schedule = [
    ['from' => 'mon', 'to' => 'thu', 'open' => '08:00', 'close' => '16:00'],
    ['from' => 'fri', 'to' => 'fri', 'open' => '08:00', 'close' => '16:30'],
    ['from' => 'sat', 'to' => 'sat', 'open' => '08:00', 'close' => '13:15'],
];

test('operating hours are saved as a schedule and shared with public pages', function () use ($schedule) {
    $this->actingAs(hoursAdmin())
        ->put(route('admin.settings.update'), ['operating_hours' => $schedule, 'operating_hours_sent' => '1'])
        ->assertSessionHasNoErrors();

    expect(app(SettingsService::class)->get('operating_hours'))->toBe($schedule);

    $this->get('/contact')->assertInertia(fn ($page) => $page->where('siteSettings.operating_hours', $schedule));
});

test('removing every row clears the schedule; omitting it keeps it', function () use ($schedule) {
    app(SettingsService::class)->setMany(['operating_hours' => $schedule]);

    $this->actingAs(hoursAdmin())->put(route('admin.settings.update'), ['company_name' => 'Kenco']);
    expect(app(SettingsService::class)->get('operating_hours'))->toBe($schedule);

    $this->actingAs(hoursAdmin())->put(route('admin.settings.update'), ['operating_hours_sent' => '1']);
    expect(app(SettingsService::class)->get('operating_hours'))->toBe([]);

    $this->get('/contact')->assertInertia(fn ($page) => $page->where('siteSettings.operating_hours', null));
});

test('a closing time before the opening time or an unknown day is rejected', function () {
    $this->actingAs(hoursAdmin())
        ->put(route('admin.settings.update'), ['operating_hours_sent' => '1', 'operating_hours' => [
            ['from' => 'mon', 'to' => 'fri', 'open' => '17:00', 'close' => '08:00'],
            ['from' => 'xyz', 'to' => 'fri', 'open' => '08:00', 'close' => '17:00'],
            ['from' => 'fri', 'to' => 'mon', 'open' => '08:00', 'close' => '17:00'],
        ]])
        ->assertSessionHasErrors(['operating_hours.0.close', 'operating_hours.1.from', 'operating_hours.2.to']);
});

test('the old free-text value becomes the requested schedule', function () use ($schedule) {
    SiteSetting::updateOrCreate(['key' => 'operating_hours'], ['value' => 'Mon-Fri, 08:00-17:00', 'type' => 'string']);

    (require database_path('migrations/2026_09_29_000001_convert_operating_hours_to_schedule.php'))->up();

    expect(app(SettingsService::class)->get('operating_hours'))->toBe($schedule);
});
