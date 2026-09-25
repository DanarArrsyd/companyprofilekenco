<?php

use App\Models\Article;
use App\Models\Capability;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

function imageRemovalAdmin(): User
{
    test()->seed(RolePermissionSeeder::class);

    return tap(User::factory()->create())->assignRole('Super Admin');
}

test('removing the featured image of an article is saved', function () {
    $article = Article::factory()->create(['featured_image' => 'library/news.webp']);

    $this->actingAs(imageRemovalAdmin())->put(route('admin.news.update', $article), [
        'title' => $article->title,
        'content' => $article->content,
        'status' => 'draft',
        'featured_image_path' => '',
    ])->assertSessionHasNoErrors();

    expect($article->fresh()->featured_image)->toBeNull();
});

test('removing the featured image of a capability is saved', function () {
    $capability = Capability::factory()->create(['featured_image' => 'library/cap.webp']);

    $this->actingAs(imageRemovalAdmin())->put(route('admin.capabilities.update', $capability), [
        'name' => $capability->name,
        'status' => 'draft',
        'sort_order' => 0,
        'featured_image_path' => '',
    ])->assertSessionHasNoErrors();

    expect($capability->fresh()->featured_image)->toBeNull();
});

test('an update that does not mention the featured image keeps it', function () {
    $article = Article::factory()->create(['featured_image' => 'library/news.webp']);

    $this->actingAs(imageRemovalAdmin())->put(route('admin.news.update', $article), [
        'title' => 'Renamed',
        'content' => $article->content,
        'status' => 'draft',
    ])->assertSessionHasNoErrors();

    expect($article->fresh()->featured_image)->toBe('library/news.webp');
});

test('removing the SEO share image is saved', function () {
    $product = Product::factory()->create();
    $product->seoMetadata()->create(['og_image' => 'library/og.webp']);

    $this->actingAs(imageRemovalAdmin())->put(route('admin.products.update', $product), [
        'name' => $product->name,
        'status' => 'draft',
        'seo' => ['meta_title' => 'Bracket', 'og_image_path' => ''],
    ])->assertSessionHasNoErrors();

    expect($product->fresh()->seoMetadata->og_image)->toBeNull();
});

test('an SEO update that does not mention the share image keeps it', function () {
    $product = Product::factory()->create();
    $product->seoMetadata()->create(['og_image' => 'library/og.webp']);

    $this->actingAs(imageRemovalAdmin())->put(route('admin.products.update', $product), [
        'name' => $product->name,
        'status' => 'draft',
        'seo' => ['meta_title' => 'Bracket'],
    ])->assertSessionHasNoErrors();

    expect($product->fresh()->seoMetadata->og_image)->toBe('library/og.webp');
});
