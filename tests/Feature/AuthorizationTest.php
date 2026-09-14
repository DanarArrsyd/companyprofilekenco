<?php

use App\Enums\UserStatus;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Permission::findOrCreate('dashboard.view', 'web');
    Role::findOrCreate('Super Admin', 'web')->syncPermissions(['dashboard.view']);
    Role::findOrCreate('Content Admin', 'web');
});

test('guest is redirected away from the dashboard', function () {
    $response = $this->get('/admin/dashboard');

    $response->assertRedirect('/admin/login');
});

test('admin without dashboard permission gets a 403', function () {
    $user = User::factory()->create();
    $user->assignRole('Content Admin');

    $response = $this->actingAs($user)->get('/admin/dashboard');

    $response->assertForbidden();
});

test('super admin with dashboard permission can view the dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole('Super Admin');

    $response = $this->actingAs($user)->get('/admin/dashboard');

    $response->assertOk();
});

test('suspended user cannot log in', function () {
    $user = User::factory()->create(['status' => UserStatus::Suspended]);

    $response = $this->post('/admin/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('suspended user is logged out and rejected on next request', function () {
    $user = User::factory()->create();
    $user->assignRole('Super Admin');

    $this->actingAs($user);

    $user->forceFill(['status' => UserStatus::Suspended])->save();

    $response = $this->get('/admin/dashboard');

    $response->assertForbidden();
    $this->assertGuest();
});
