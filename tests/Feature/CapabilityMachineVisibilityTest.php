<?php

use App\Enums\ContentStatus;
use App\Models\Capability;
use App\Models\Machine;
use App\Models\User;
use Spatie\Permission\Models\Permission;

test('a capability page only lists published machines', function () {
    $capability = Capability::factory()->published()->create(['slug' => 'progressive-die-stamping']);
    $published = Machine::factory()->create(['name' => 'Press Amada 200T']);
    $draft = Machine::factory()->create(['name' => 'Press Komatsu 80T', 'status' => ContentStatus::Draft]);
    $capability->machines()->sync([$published->id, $draft->id]);

    $this->get('/capabilities/progressive-die-stamping')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('capability.machines', 1)
            ->where('capability.machines.0.name', 'Press Amada 200T'));
});

test('the edit form keeps an attached unpublished machine so it can be detached', function () {
    Permission::findOrCreate('capabilities.update', 'web');
    $user = tap(User::factory()->create())->givePermissionTo('capabilities.update');
    $capability = Capability::factory()->create();
    $attachedDraft = Machine::factory()->create(['name' => 'Attached draft', 'status' => ContentStatus::Draft]);
    Machine::factory()->create(['name' => 'Loose draft', 'status' => ContentStatus::Draft]);
    $published = Machine::factory()->create(['name' => 'Published press']);
    $capability->machines()->sync([$attachedDraft->id]);

    $this->actingAs($user)->get(route('admin.capabilities.edit', $capability))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('availableMachines', 2)
            ->where('availableMachines', fn ($machines) => collect($machines)->pluck('is_published', 'name')->all() === [
                'Attached draft' => false,
                'Published press' => true,
            ]));
});
