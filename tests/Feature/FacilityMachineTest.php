<?php

use App\Models\Facility;
use App\Models\FacilityCategory;
use App\Models\Machine;
use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    foreach (['facilities.view', 'facilities.create', 'facilities.update', 'facilities.delete'] as $permission) {
        Permission::findOrCreate($permission, 'web');
    }
});

test('admin can create a facility with a category', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('facilities.create');
    $category = FacilityCategory::factory()->create();

    $response = $this->actingAs($user)->post(route('admin.facilities.store'), [
        'facility_category_id' => $category->id,
        'name' => 'Main Plant',
        'status' => 'draft',
    ]);

    $response->assertRedirect();
    $facility = Facility::where('name', 'Main Plant')->firstOrFail();
    expect($facility->category->is($category))->toBeTrue();
});

test('admin can create a machine assigned to a facility', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('facilities.create');
    $facility = Facility::factory()->create();

    $response = $this->actingAs($user)->post(route('admin.machines.store'), [
        'facility_id' => $facility->id,
        'name' => 'CNC Lathe',
        'quantity' => 2,
        'status' => 'published',
    ]);

    $response->assertRedirect();
    $machine = Machine::where('name', 'CNC Lathe')->firstOrFail();
    expect($machine->facility->is($facility))->toBeTrue()
        ->and($machine->quantity)->toBe(2);
});

test('facility list can be filtered by category', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('facilities.view');
    $categoryA = FacilityCategory::factory()->create();
    $categoryB = FacilityCategory::factory()->create();
    Facility::factory()->create(['facility_category_id' => $categoryA->id, 'name' => 'Plant A']);
    Facility::factory()->create(['facility_category_id' => $categoryB->id, 'name' => 'Plant B']);

    $response = $this->actingAs($user)->get(route('admin.facilities', ['category' => $categoryA->id]));

    $response->assertInertia(fn ($page) => $page
        ->component('admin/facilities/Index')
        ->has('facilities.data', 1)
    );
});

test('machine quantity must be a valid integer', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('facilities.create');

    $response = $this->actingAs($user)->post(route('admin.machines.store'), [
        'name' => 'Bad Machine',
        'quantity' => 'not-a-number',
        'status' => 'published',
    ]);

    $response->assertSessionHasErrors('quantity');
});
