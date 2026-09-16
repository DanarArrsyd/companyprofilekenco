<?php

use App\Models\Milestone;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Storage::fake('public');
    foreach (['milestones.view', 'milestones.create', 'milestones.update', 'milestones.delete'] as $permission) {
        Permission::findOrCreate($permission, 'web');
    }
});

test('authorized user can view the milestones list', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('milestones.view');

    Milestone::factory()->create(['year' => 2015, 'title' => 'ISO certified']);

    $response = $this->actingAs($user)->get(route('admin.milestones'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/milestones/Index')
        ->has('milestones.data', 1)
        ->where('milestones.data.0.title', 'ISO certified')
    );
});

test('user without permission is forbidden from the milestones list', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('admin.milestones'));

    $response->assertForbidden();
});

test('admin can create a milestone with an uploaded image', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('milestones.create');

    $response = $this->actingAs($user)->post(route('admin.milestones.store'), [
        'year' => 2021,
        'title' => 'New plant opened',
        'description' => 'Second production line commissioned.',
        'image' => UploadedFile::fake()->image('milestone.jpg')->size(500),
        'order' => 3,
    ]);

    $response->assertRedirect(route('admin.milestones'));

    $milestone = Milestone::where('title', 'New plant opened')->firstOrFail();
    expect($milestone->year)->toBe(2021);
    expect($milestone->image)->not->toBeNull();
    Storage::disk('public')->assertExists($milestone->image);
});

test('admin can create a milestone by selecting an image from the media library', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('milestones.create');

    Storage::disk('public')->put('milestones/existing.jpg', 'fake-bytes');

    $response = $this->actingAs($user)->post(route('admin.milestones.store'), [
        'year' => 2019,
        'title' => 'Aerospace qualification',
        'image_path' => 'milestones/existing.jpg',
        'order' => 0,
    ]);

    $response->assertRedirect(route('admin.milestones'));
    $this->assertDatabaseHas('milestones', [
        'title' => 'Aerospace qualification',
        'image' => 'milestones/existing.jpg',
    ]);
});

test('admin can edit a milestone', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('milestones.update');

    $milestone = Milestone::factory()->create(['year' => 2012, 'title' => 'Old title']);

    $response = $this->actingAs($user)->put(route('admin.milestones.update', $milestone), [
        'year' => 2012,
        'title' => 'Updated title',
        'description' => 'Updated description.',
        'order' => 5,
    ]);

    $response->assertRedirect();
    expect($milestone->fresh()->title)->toBe('Updated title');
    expect($milestone->fresh()->order)->toBe(5);
});

test('admin can remove a milestone image without deleting the milestone', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('milestones.update');

    Storage::disk('public')->put('milestones/old.jpg', 'fake-bytes');
    $milestone = Milestone::factory()->create(['image' => 'milestones/old.jpg']);

    $response = $this->actingAs($user)->put(route('admin.milestones.update', $milestone), [
        'year' => $milestone->year,
        'title' => $milestone->title,
        'order' => $milestone->order,
        'remove_image' => true,
    ]);

    $response->assertRedirect();
    expect($milestone->fresh()->image)->toBeNull();
});

test('admin can delete a milestone', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('milestones.delete');

    $milestone = Milestone::factory()->create();

    $response = $this->actingAs($user)->delete(route('admin.milestones.destroy', $milestone));

    $response->assertRedirect(route('admin.milestones'));
    $this->assertDatabaseMissing('milestones', ['id' => $milestone->id]);
});

test('unauthorized user cannot create, update, or delete a milestone', function () {
    $user = User::factory()->create();
    $milestone = Milestone::factory()->create();

    $this->actingAs($user)->post(route('admin.milestones.store'), ['year' => 2020, 'title' => 'X'])->assertForbidden();
    $this->actingAs($user)->put(route('admin.milestones.update', $milestone), ['year' => 2020, 'title' => 'X'])->assertForbidden();
    $this->actingAs($user)->delete(route('admin.milestones.destroy', $milestone))->assertForbidden();
});

test('homepage exposes milestone image path so the public timeline can render it', function () {
    Milestone::factory()->create([
        'year' => 2018,
        'title' => 'Facility expanded',
        'image' => 'milestones/2018.jpg',
    ]);

    $response = $this->get('/');

    $response->assertInertia(fn ($page) => $page
        ->component('public/Home')
        ->where('milestones.0.image', 'milestones/2018.jpg')
    );
});

test('homepage exposes null image for a milestone with none, so the frontend renders its placeholder', function () {
    Milestone::factory()->create(['year' => 2011, 'title' => 'Founded', 'image' => null]);

    $response = $this->get('/');

    $response->assertInertia(fn ($page) => $page
        ->component('public/Home')
        ->where('milestones.0.image', null)
    );
});

test('homepage milestones are ordered chronologically by year', function () {
    Milestone::factory()->create(['year' => 2022, 'title' => 'Second plant']);
    Milestone::factory()->create(['year' => 2010, 'title' => 'Founded']);
    Milestone::factory()->create(['year' => 2015, 'title' => 'ISO certified']);

    $response = $this->get('/');

    $response->assertInertia(fn ($page) => $page
        ->component('public/Home')
        ->where('milestones.0.year', 2010)
        ->where('milestones.1.year', 2015)
        ->where('milestones.2.year', 2022)
    );
});
