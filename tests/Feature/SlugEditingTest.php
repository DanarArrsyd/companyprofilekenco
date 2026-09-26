<?php

use App\Models\Article;
use App\Models\Capability;
use App\Models\JobVacancy;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->admin = tap(User::factory()->create())->assignRole('Super Admin');
});

dataset('public detail pages', [
    'product' => [fn () => Product::factory()->published()->create(['slug' => 'old-bracket']), 'products', 'products', fn ($m) => ['name' => $m->name, 'status' => 'published']],
    'capability' => [fn () => Capability::factory()->published()->create(['slug' => 'old-bracket']), 'capabilities', 'capabilities', fn ($m) => ['name' => $m->name, 'status' => 'published', 'sort_order' => 0]],
    'article' => [fn () => Article::factory()->published()->create(['slug' => 'old-bracket']), 'news', 'news', fn ($m) => ['title' => $m->title, 'content' => $m->content, 'status' => 'published']],
    'vacancy' => [fn () => JobVacancy::factory()->published()->create(['slug' => 'old-bracket']), 'careers', 'careers', fn ($m) => ['title' => $m->title, 'status' => 'published']],
]);

test('changing a slug moves the page and redirects the old address', function (Closure $make, string $adminRoute, string $path, Closure $fields) {
    $model = $make();

    $this->actingAs($this->admin)
        ->put(route("admin.{$adminRoute}.update", $model), [...$fields($model), 'slug' => 'new-bracket'])
        ->assertSessionHasNoErrors();

    expect($model->fresh()->slug)->toBe('new-bracket');

    auth()->logout();
    $this->get("/{$path}/new-bracket")->assertOk();
    $this->get("/{$path}/old-bracket")->assertRedirect("/{$path}/new-bracket")->assertStatus(301);
    $this->get("/en/{$path}/old-bracket")->assertRedirect("/en/{$path}/new-bracket")->assertStatus(301);
    $this->get("/{$path}/never-existed")->assertNotFound();
})->with('public detail pages');

test('renaming back and forth never redirects a live address', function () {
    $product = Product::factory()->published()->create(['slug' => 'alpha']);
    $save = fn (string $slug) => $this->actingAs($this->admin)
        ->put(route('admin.products.update', $product), ['name' => $product->name, 'status' => 'published', 'slug' => $slug])
        ->assertSessionHasNoErrors();

    $save('beta');
    $save('alpha');

    auth()->logout();
    $this->get('/products/alpha')->assertOk();
    $this->get('/products/beta')->assertRedirect('/products/alpha');
});

test('a draft never becomes reachable through an old slug', function () {
    $product = Product::factory()->published()->create(['slug' => 'old-bracket']);

    $this->actingAs($this->admin)
        ->put(route('admin.products.update', $product), ['name' => $product->name, 'status' => 'draft', 'slug' => 'new-bracket']);

    auth()->logout();
    $this->get('/products/old-bracket')->assertNotFound();
});

test('slugs are validated and must stay unique', function () {
    Product::factory()->create(['slug' => 'taken']);
    $product = Product::factory()->create(['slug' => 'mine']);
    $put = fn (string $slug) => $this->actingAs($this->admin)
        ->put(route('admin.products.update', $product), ['name' => $product->name, 'status' => 'draft', 'slug' => $slug]);

    $put('Not A Slug')->assertSessionHasErrors('slug');
    $put('taken')->assertSessionHasErrors('slug');
    $put('')->assertSessionHasErrors('slug');
    $put('mine')->assertSessionHasNoErrors();
});

test('category slugs can be edited too', function () {
    $category = ProductCategory::factory()->create(['slug' => 'brackets']);

    $this->actingAs($this->admin)
        ->put(route('admin.products.categories.update', $category), ['name' => $category->name, 'status' => 'published', 'sort_order' => 0, 'slug' => 'steel-brackets'])
        ->assertSessionHasNoErrors();

    expect($category->fresh()->slug)->toBe('steel-brackets');
});
