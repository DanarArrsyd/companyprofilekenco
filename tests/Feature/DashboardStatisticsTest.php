<?php

use App\Models\Article;
use App\Models\ContactInquiry;
use App\Models\JobVacancy;
use App\Models\Product;
use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Permission::findOrCreate('dashboard.view', 'web');
});

test('dashboard renders real statistics safely', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('dashboard.view');

    Product::factory()->published()->create();
    Article::factory()->published()->create();
    JobVacancy::factory()->published()->create(['closes_at' => now()->addWeek()]);
    ContactInquiry::factory()->create(['status' => 'new']);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/Dashboard')
        ->where('stats.publishedProducts', 1)
        ->where('stats.publishedNews', 1)
        ->where('stats.openJobVacancies', 1)
        ->where('stats.newInquiries', 1)
    );
});

test('dashboard renders an empty state safely when there is no data', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('dashboard.view');

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/Dashboard')
        ->where('stats.publishedProducts', 0)
    );
});
