<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    foreach (['dashboard.view', 'products.view', 'news.view', 'users.manage'] as $permission) {
        Permission::findOrCreate($permission, 'web');
    }
});

test('guest is redirected away from an admin module page', function () {
    $response = $this->get('/admin/products');

    $response->assertRedirect('/admin/login');
});

test('admin with matching permission can open a module placeholder page', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('products.view');

    $response = $this->actingAs($user)->get(route('admin.products'));

    $response->assertOk();
});

test('admin without matching permission is forbidden from a module placeholder page', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('news.view');

    $response = $this->actingAs($user)->get(route('admin.users'));

    $response->assertForbidden();
});

test('super admin can reach every seeded module placeholder route', function () {
    $this->seed(\Database\Seeders\RolePermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Super Admin');

    $routes = [
        'admin.pages', 'admin.homepage', 'admin.products', 'admin.products.categories',
        'admin.capabilities', 'admin.facilities', 'admin.machines', 'admin.certifications',
        'admin.industries', 'admin.news', 'admin.news.categories', 'admin.careers',
        'admin.careers.applications', 'admin.inquiries', 'admin.media', 'admin.seo',
        'admin.users', 'admin.roles', 'admin.activity-logs', 'admin.settings',
    ];

    foreach ($routes as $name) {
        $this->actingAs($user)->get(route($name))->assertOk();
    }
});

test('dashboard exposes summary stats and recent sections', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('dashboard.view');

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/Dashboard')
        ->has('stats.publishedProducts')
        ->has('stats.publishedNews')
        ->has('stats.openJobVacancies')
        ->has('stats.newInquiries')
        ->has('recentContent')
        ->has('recentInquiries')
        ->has('recentActivity')
    );
});
