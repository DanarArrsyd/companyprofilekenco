<?php

use App\Enums\UserStatus;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Permission::findOrCreate('users.manage', 'web');
    Role::findOrCreate('Super Admin', 'web');
});

function createUserAdmin(): User
{
    $user = User::factory()->create();
    $user->givePermissionTo('users.manage');

    return $user;
}

test('authorized admin can create a user with a role', function () {
    $admin = createUserAdmin();
    Role::findOrCreate('Content Admin', 'web');

    $response = $this->actingAs($admin)->post(route('admin.users.store'), [
        'name' => 'New Editor',
        'email' => 'editor@example.com',
        'password' => 'StrongPass!234',
        'password_confirmation' => 'StrongPass!234',
        'roles' => ['Content Admin'],
    ]);

    $response->assertRedirect();
    $user = User::where('email', 'editor@example.com')->firstOrFail();
    expect($user->hasRole('Content Admin'))->toBeTrue();
});

test('unauthorized user cannot manage users', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('admin.users'))->assertForbidden();
});

test('admin can update a user and their roles', function () {
    $admin = createUserAdmin();
    Role::findOrCreate('Content Admin', 'web');
    $target = User::factory()->create();

    $response = $this->actingAs($admin)->put(route('admin.users.update', $target), [
        'name' => 'Updated Name',
        'email' => $target->email,
        'roles' => ['Content Admin'],
    ]);

    $response->assertRedirect();
    expect($target->fresh()->name)->toBe('Updated Name')
        ->and($target->fresh()->hasRole('Content Admin'))->toBeTrue();
});

test('admin can suspend another user', function () {
    $admin = createUserAdmin();
    $target = User::factory()->create();

    $response = $this->actingAs($admin)->put(route('admin.users.status', $target), ['status' => 'suspended']);

    $response->assertRedirect();
    expect($target->fresh()->status)->toBe(UserStatus::Suspended);
});

test('suspended user cannot log in', function () {
    $user = User::factory()->create(['status' => UserStatus::Suspended]);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertForbidden();
});

test('super admin cannot suspend their own account', function () {
    $admin = createUserAdmin();
    $admin->assignRole('Super Admin');

    $response = $this->actingAs($admin)->put(route('admin.users.status', $admin), ['status' => 'suspended']);

    $response->assertSessionHasErrors('status');
    expect($admin->fresh()->status)->toBe(UserStatus::Active);
});

test('the last active super admin cannot be suspended', function () {
    $admin = createUserAdmin();
    $lastSuperAdmin = User::factory()->create(['status' => UserStatus::Active]);
    $lastSuperAdmin->assignRole('Super Admin');

    $response = $this->actingAs($admin)->put(route('admin.users.status', $lastSuperAdmin), ['status' => 'suspended']);

    $response->assertSessionHasErrors('status');
    expect($lastSuperAdmin->fresh()->status)->toBe(UserStatus::Active);
});

test('a second active super admin can be suspended safely', function () {
    $admin = createUserAdmin();
    $first = User::factory()->create(['status' => UserStatus::Active]);
    $first->assignRole('Super Admin');
    $second = User::factory()->create(['status' => UserStatus::Active]);
    $second->assignRole('Super Admin');

    $response = $this->actingAs($admin)->put(route('admin.users.status', $second), ['status' => 'suspended']);

    $response->assertRedirect();
    expect($second->fresh()->status)->toBe(UserStatus::Suspended);
});

test('admin can generate a temporary password for a user', function () {
    $admin = createUserAdmin();
    $target = User::factory()->create();
    $originalHash = $target->password;

    $response = $this->actingAs($admin)->put(route('admin.users.password', $target), ['mode' => 'generate']);

    $response->assertRedirect();
    expect($target->fresh()->password)->not->toBe($originalHash);
});
