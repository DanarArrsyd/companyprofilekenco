<?php

use App\Enums\ContentStatus;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    foreach (['products.view', 'products.create', 'products.update', 'products.delete'] as $permission) {
        Permission::findOrCreate($permission, 'web');
    }
});

function createProductAdmin(array $permissions): User
{
    $user = User::factory()->create();
    $user->givePermissionTo($permissions);

    return $user;
}

test('authorized admin can view the product list', function () {
    $user = createProductAdmin(['products.view']);

    $this->actingAs($user)->get(route('admin.products'))->assertOk();
});

test('unauthorized user is denied access to the product list', function () {
    $user = createProductAdmin([]);

    $this->actingAs($user)->get(route('admin.products'))->assertForbidden();
});

test('admin can create a product', function () {
    $user = createProductAdmin(['products.create']);
    $category = ProductCategory::factory()->create();

    $response = $this->actingAs($user)->post(route('admin.products.store'), [
        'product_category_id' => $category->id,
        'name' => 'Bracket Assembly',
        'status' => 'draft',
        'seo' => [],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('products', ['name' => 'Bracket Assembly', 'slug' => 'bracket-assembly']);
});

test('product slug must be unique', function () {
    $user = createProductAdmin(['products.create']);
    Product::factory()->create(['slug' => 'bracket-assy']);

    $response = $this->actingAs($user)->post(route('admin.products.store'), [
        'name' => 'Bracket Assy Duplicate',
        'slug' => 'bracket-assy',
        'status' => 'draft',
        'seo' => [],
    ]);

    $response->assertSessionHasErrors('slug');
});

test('draft product is not publicly accessible', function () {
    Product::factory()->create(['slug' => 'draft-product', 'status' => ContentStatus::Draft]);

    $this->get('/products/draft-product')->assertNotFound();
});

test('published product is publicly accessible', function () {
    Product::factory()->published()->create(['slug' => 'published-product']);

    $this->get('/products/published-product')->assertOk();
});

test('archived product is not publicly accessible', function () {
    Product::factory()->archived()->create(['slug' => 'archived-product']);

    $this->get('/products/archived-product')->assertNotFound();
});

test('product with future published_at is not publicly accessible', function () {
    Product::factory()->create([
        'slug' => 'future-product',
        'status' => ContentStatus::Published,
        'published_at' => now()->addWeek(),
    ]);

    $this->get('/products/future-product')->assertNotFound();
});

test('product belongs to its category', function () {
    $category = ProductCategory::factory()->create();
    $product = Product::factory()->create(['product_category_id' => $category->id]);

    expect($product->category->is($category))->toBeTrue();
});

test('product has many images', function () {
    $product = Product::factory()->create();
    $product->images()->create(['path' => 'products/gallery/a.jpg', 'order' => 0]);
    $product->images()->create(['path' => 'products/gallery/b.jpg', 'order' => 1]);

    expect($product->images)->toHaveCount(2);
});

test('product has polymorphic seo metadata', function () {
    $user = createProductAdmin(['products.create']);

    $this->actingAs($user)->post(route('admin.products.store'), [
        'name' => 'SEO Product',
        'status' => 'draft',
        'seo' => ['meta_title' => 'Custom SEO Title'],
    ]);

    $product = Product::where('name', 'SEO Product')->firstOrFail();

    expect($product->seoMetadata)->not->toBeNull()
        ->and($product->seoMetadata->meta_title)->toBe('Custom SEO Title');
});

test('admin can delete a product and restore it', function () {
    $user = createProductAdmin(['products.delete']);
    $product = Product::factory()->create();

    $this->actingAs($user)->delete(route('admin.products.destroy', $product))->assertRedirect();
    $this->assertSoftDeleted('products', ['id' => $product->id]);

    $this->actingAs($user)->post(route('admin.products.restore', $product->id))->assertRedirect();
    expect($product->fresh()->trashed())->toBeFalse();
});
