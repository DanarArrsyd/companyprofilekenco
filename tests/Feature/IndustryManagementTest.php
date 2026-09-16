<?php

use App\Enums\ContentStatus;
use App\Models\Industry;
use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    foreach (['industries.view', 'industries.create'] as $permission) {
        Permission::findOrCreate($permission, 'web');
    }
});

test('admin can create an industry', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('industries.create');

    $response = $this->actingAs($user)->post(route('admin.industries.store'), [
        'name' => 'Automotive',
        'status' => 'published',
        'published_at' => now()->subDay()->toDateTimeString(),
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('industries', ['name' => 'Automotive', 'slug' => 'automotive']);
});

test('published industries are rendered on the public industries page', function () {
    Industry::factory()->published()->create(['name' => 'Aerospace']);
    Industry::factory()->create(['name' => 'Draft Industry', 'status' => ContentStatus::Draft]);

    $response = $this->get('/industries');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/industries/Index')
        ->has('industries', 1)
        ->where('industries.0.name', 'Aerospace')
    );
});
