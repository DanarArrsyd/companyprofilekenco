<?php

use App\Models\User;
use App\Services\ActivityLogService;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Permission::findOrCreate('users.manage', 'web');
});

test('authorized admin can view the activity log', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('users.manage');

    $this->actingAs($user)->get(route('admin.activity-logs'))->assertOk();
});

test('unauthorized user cannot view the activity log', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('admin.activity-logs'))->assertForbidden();
});

test('sensitive values are sanitized before being persisted', function () {
    app(ActivityLogService::class)->record('user.password_reset', null, [
        'name' => 'Jane Doe',
        'password' => 'super-secret-value',
        'old' => ['token' => 'abc123', 'company_name' => 'Old Co'],
        'new' => ['token' => 'def456', 'company_name' => 'New Co'],
    ]);

    $log = \App\Models\ActivityLog::latest('id')->first();

    expect($log->properties['password'])->toBe('[REDACTED]')
        ->and($log->properties['old']['token'])->toBe('[REDACTED]')
        ->and($log->properties['new']['token'])->toBe('[REDACTED]')
        ->and($log->properties['old']['company_name'])->toBe('Old Co');
});

test('activity log detail view is read only and exposes no edit route', function () {
    expect(\Illuminate\Support\Facades\Route::has('admin.activity-logs.update'))->toBeFalse();
});
