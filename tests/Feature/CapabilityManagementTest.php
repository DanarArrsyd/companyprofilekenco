<?php

use App\Models\Capability;
use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    foreach (['capabilities.view', 'capabilities.create', 'capabilities.update', 'capabilities.delete'] as $permission) {
        Permission::findOrCreate($permission, 'web');
    }
});

test('authorized admin can create a capability', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('capabilities.create');

    $response = $this->actingAs($user)->post(route('admin.capabilities.store'), [
        'name' => 'CNC Machining',
        'status' => 'draft',
        'seo' => [],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('capabilities', ['name->en' => 'CNC Machining', 'slug' => 'cnc-machining']);
});

test('capability publishing sets published_at', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('capabilities.update');
    $capability = Capability::factory()->create();

    $this->actingAs($user)->post(route('admin.capabilities.publish', $capability))->assertRedirect();

    expect($capability->fresh()->status->value)->toBe('published')
        ->and($capability->fresh()->published_at)->not->toBeNull();
});
