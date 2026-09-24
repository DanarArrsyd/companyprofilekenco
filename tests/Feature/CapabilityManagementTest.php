<?php

use App\Models\Capability;
use App\Models\Machine;
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

test('admin can add and reorder capability steps', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('capabilities.update');
    $capability = Capability::factory()->create();

    $this->actingAs($user)->post(route('admin.capabilities.steps.store', $capability), ['title' => 'Step A'])->assertRedirect();
    $this->actingAs($user)->post(route('admin.capabilities.steps.store', $capability), ['title' => 'Step B'])->assertRedirect();

    $steps = $capability->steps()->orderBy('sort_order')->get();
    expect($steps)->toHaveCount(2)
        ->and($steps[0]->title)->toBe('Step A');

    $this->actingAs($user)->post(route('admin.capabilities.steps.reorder', $capability), [
        'ordered_ids' => [$steps[1]->id, $steps[0]->id],
    ])->assertRedirect();

    expect($steps[1]->fresh()->sort_order)->toBe(0)
        ->and($steps[0]->fresh()->sort_order)->toBe(1);
});

test('capability can be assigned machines without duplicating the pivot', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('capabilities.update');
    $capability = Capability::factory()->create();
    $machine = Machine::factory()->create();

    $this->actingAs($user)->post(route('admin.capabilities.machines', $capability), ['machine_ids' => [$machine->id]])->assertRedirect();
    $this->actingAs($user)->post(route('admin.capabilities.machines', $capability), ['machine_ids' => [$machine->id]])->assertRedirect();

    expect($capability->machines()->count())->toBe(1);
    $this->assertDatabaseCount('capability_machine', 1);
});

test('capability publishing sets published_at', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('capabilities.update');
    $capability = Capability::factory()->create();

    $this->actingAs($user)->post(route('admin.capabilities.publish', $capability))->assertRedirect();

    expect($capability->fresh()->status->value)->toBe('published')
        ->and($capability->fresh()->published_at)->not->toBeNull();
});
