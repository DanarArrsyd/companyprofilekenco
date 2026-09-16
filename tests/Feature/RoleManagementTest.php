<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Permission::findOrCreate('users.manage', 'web');
    Permission::findOrCreate('products.view', 'web');
    Permission::findOrCreate('products.create', 'web');
    Role::findOrCreate('Super Admin', 'web');
    Role::findOrCreate('Content Admin', 'web');
});

function createRoleAdmin(): User
{
    $user = User::factory()->create();
    $user->givePermissionTo('users.manage');

    return $user;
}

test('authorized admin can create a role with permissions', function () {
    $admin = createRoleAdmin();

    $response = $this->actingAs($admin)->post(route('admin.roles.store'), [
        'name' => 'Editor',
        'permissions' => ['products.view', 'products.create'],
    ]);

    $response->assertRedirect();
    $role = Role::where('name', 'Editor')->firstOrFail();
    expect($role->permissions->pluck('name')->all())->toEqualCanonicalizing(['products.view', 'products.create']);
});

test('unauthorized user cannot manage roles', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('admin.roles'))->assertForbidden();
});

test('admin can edit a custom role permission set', function () {
    $admin = createRoleAdmin();
    $role = Role::findOrCreate('Editor', 'web');
    $role->syncPermissions(['products.view']);

    $response = $this->actingAs($admin)->put(route('admin.roles.update', $role), [
        'permissions' => ['products.view', 'products.create'],
    ]);

    $response->assertRedirect();
    expect($role->fresh()->permissions->pluck('name')->all())->toEqualCanonicalizing(['products.view', 'products.create']);
});

test('super admin permissions cannot be edited', function () {
    $admin = createRoleAdmin();
    $superAdmin = Role::where('name', 'Super Admin')->firstOrFail();

    $response = $this->actingAs($admin)->put(route('admin.roles.update', $superAdmin), [
        'permissions' => ['products.view'],
    ]);

    $response->assertSessionHasErrors('permissions');
});

test('system roles cannot be deleted', function () {
    $admin = createRoleAdmin();
    $contentAdmin = Role::where('name', 'Content Admin')->firstOrFail();

    $response = $this->actingAs($admin)->delete(route('admin.roles.destroy', $contentAdmin));

    $response->assertSessionHasErrors('role');
    $this->assertDatabaseHas('roles', ['id' => $contentAdmin->id]);
});

test('a custom role not assigned to anyone can be deleted', function () {
    $admin = createRoleAdmin();
    $role = Role::findOrCreate('Temporary Role', 'web');

    $response = $this->actingAs($admin)->delete(route('admin.roles.destroy', $role));

    $response->assertRedirect();
    $this->assertDatabaseMissing('roles', ['id' => $role->id]);
});
