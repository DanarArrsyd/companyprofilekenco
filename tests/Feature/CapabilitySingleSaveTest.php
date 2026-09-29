<?php

use App\Models\Capability;
use App\Models\CapabilityStep;
use App\Models\Machine;
use App\Models\User;
use Spatie\Permission\Models\Permission;

function singleSaveAdmin(): User
{
    Permission::findOrCreate('capabilities.update', 'web');

    return tap(User::factory()->create())->givePermissionTo('capabilities.update');
}

function capabilityPayload(Capability $capability, array $extra = []): array
{
    return array_merge([
        'name' => $capability->name,
        'status' => $capability->status->value,
        'seo' => [],
    ], $extra);
}

test('one save updates, adds, removes and orders the steps and syncs the machines', function () {
    $capability = Capability::factory()->create();
    $keep = $capability->steps()->create(['title' => 'Design', 'sort_order' => 0]);
    $drop = $capability->steps()->create(['title' => 'Old step', 'sort_order' => 1]);
    [$press, $robot] = Machine::factory()->count(2)->create();
    $capability->machines()->sync([$robot->id]);

    $this->actingAs(singleSaveAdmin())->put(route('admin.capabilities.update', $capability), capabilityPayload($capability, [
        'steps' => [
            ['id' => null, 'title' => 'Stamping', 'description' => 'Progressive die', 'translations' => ['id' => ['title' => 'Stamping', 'description' => 'Die progresif']]],
            ['id' => $keep->id, 'title' => 'Die design', 'description' => '', 'translations' => ['id' => ['title' => 'Desain die', 'description' => '']]],
        ],
        'machine_ids' => [$press->id],
    ]))->assertSessionHasNoErrors()->assertRedirect();

    $steps = $capability->steps()->orderBy('sort_order')->get();

    expect($steps->pluck('title')->all())->toBe(['Stamping', 'Die design'])
        ->and($steps[1]->id)->toBe($keep->id)
        ->and($steps[0]->getTranslation('description', 'id'))->toBe('Die progresif')
        ->and($steps[1]->getTranslation('title', 'id'))->toBe('Desain die')
        ->and(CapabilityStep::find($drop->id))->toBeNull()
        ->and($capability->machines()->pluck('machines.id')->all())->toBe([$press->id]);
});

test('a save without steps or machines leaves them untouched', function () {
    $capability = Capability::factory()->create();
    $capability->steps()->create(['title' => 'Design', 'sort_order' => 0]);
    $machine = Machine::factory()->create();
    $capability->machines()->sync([$machine->id]);

    $this->actingAs(singleSaveAdmin())
        ->put(route('admin.capabilities.update', $capability), capabilityPayload($capability))
        ->assertSessionHasNoErrors();

    expect($capability->steps()->count())->toBe(1)
        ->and($capability->machines()->count())->toBe(1);
});

test('a step of another capability cannot be edited through this one', function () {
    $capability = Capability::factory()->create();
    $foreign = Capability::factory()->create()->steps()->create(['title' => 'Foreign', 'sort_order' => 0]);

    $this->actingAs(singleSaveAdmin())
        ->put(route('admin.capabilities.update', $capability), capabilityPayload($capability, [
            'steps' => [['id' => $foreign->id, 'title' => 'Hijacked']],
        ]))
        ->assertSessionHasErrors('steps.0.id');

    expect($foreign->fresh()->title)->toBe('Foreign');
});

test('removing every step and machine from the form clears them', function () {
    $capability = Capability::factory()->create();
    $capability->steps()->create(['title' => 'Design', 'sort_order' => 0]);
    $capability->machines()->sync([Machine::factory()->create()->id]);

    // What the FormData post carries when both lists are empty: only the flag.
    $this->actingAs(singleSaveAdmin())
        ->put(route('admin.capabilities.update', $capability), capabilityPayload($capability, ['sync_relations' => '1']))
        ->assertSessionHasNoErrors();

    expect($capability->steps()->count())->toBe(0)
        ->and($capability->machines()->count())->toBe(0);
});
