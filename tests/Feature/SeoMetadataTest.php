<?php

use App\Models\Product;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;

function setSeoSetting(string $key, string $value, string $type = 'string'): void
{
    SiteSetting::updateOrCreate(['key' => $key], ['value' => $value, 'type' => $type]);
    Cache::forget('site_settings.all');
}

test('product with no seo override falls back to "Name | Company" title format', function () {
    setSeoSetting('company_name', 'PT. Kenco Manufactur Indonesia');
    $product = Product::factory()->published()->create(['name' => 'Precision Shaft', 'slug' => 'precision-shaft']);

    $response = $this->get('/products/precision-shaft');

    $response->assertInertia(fn ($page) => $page
        ->where('seo.title', 'Precision Shaft | PT. Kenco Manufactur Indonesia')
    );
});

test('product with a custom seo meta title uses the override verbatim', function () {
    setSeoSetting('company_name', 'PT. Kenco Manufactur Indonesia');
    $product = Product::factory()->published()->create(['slug' => 'custom-title-product']);
    $product->seoMetadata()->create(['meta_title' => 'Totally Custom Title']);

    $response = $this->get('/products/custom-title-product');

    $response->assertInertia(fn ($page) => $page->where('seo.title', 'Totally Custom Title'));
});

test('canonical url defaults to the current request url when no override is set', function () {
    $product = Product::factory()->published()->create(['slug' => 'canonical-default']);

    $response = $this->get('/products/canonical-default');

    $response->assertInertia(fn ($page) => $page
        ->where('seo.canonical_url', url('/products/canonical-default'))
    );
});

test('canonical url override wins over the computed default', function () {
    $product = Product::factory()->published()->create(['slug' => 'canonical-override']);
    $product->seoMetadata()->create(['canonical_url' => 'https://example.com/custom-canonical']);

    $response = $this->get('/products/canonical-override');

    $response->assertInertia(fn ($page) => $page
        ->where('seo.canonical_url', 'https://example.com/custom-canonical')
    );
});

test('og image falls back to the site default when neither the entity nor its seo override has one', function () {
    setSeoSetting('seo_default_og_image', 'settings/default-og.jpg', 'image');
    $product = Product::factory()->published()->create(['slug' => 'no-image-product', 'featured_image' => null]);

    $response = $this->get('/products/no-image-product');

    $response->assertInertia(fn ($page) => $page
        ->where('seo.og_image', url('/storage/settings/default-og.jpg'))
    );
});

test('og image prefers the entity featured image over the site default', function () {
    setSeoSetting('seo_default_og_image', 'settings/default-og.jpg', 'image');
    $product = Product::factory()->published()->create(['slug' => 'with-image-product', 'featured_image' => 'products/shaft.jpg']);

    $response = $this->get('/products/with-image-product');

    $response->assertInertia(fn ($page) => $page
        ->where('seo.og_image', url('/storage/products/shaft.jpg'))
    );
});

test('draft preview metadata is always noindex, nofollow', function () {
    setSeoSetting('seo_default_robots', 'index,follow');
    $product = Product::factory()->create(['name' => 'Draft Product', 'status' => 'draft']);
    $user = App\Models\User::factory()->create();
    $user->givePermissionTo(Spatie\Permission\Models\Permission::findOrCreate('products.view', 'web'));

    $response = $this->actingAs($user)->get(route('admin.products.preview', $product));

    $response->assertInertia(fn ($page) => $page
        ->where('seo.robots_index', false)
        ->where('seo.robots_follow', false)
    );
});

test('site-wide default robots setting applies to pages with no seo record at all', function () {
    app()->detectEnvironment(fn () => 'production');
    setSeoSetting('seo_default_robots', 'noindex,follow');

    $response = $this->get('/products');

    $response->assertInertia(fn ($page) => $page
        ->where('seo.robots_index', false)
        ->where('seo.robots_follow', true)
    );

    app()->detectEnvironment(fn () => 'testing');
});

test('non-production environments are always noindex, nofollow regardless of any per-page setting', function () {
    setSeoSetting('seo_default_robots', 'index,follow');
    $product = Product::factory()->published()->create(['slug' => 'non-production-noindex']);
    $product->seoMetadata()->create(['robots_index' => true, 'robots_follow' => true]);

    $response = $this->get('/products/non-production-noindex');

    $response->assertInertia(fn ($page) => $page
        ->where('seo.robots_index', false)
        ->where('seo.robots_follow', false)
    );
});

test('homepage title is the company name alone, never duplicated with a separator', function () {
    setSeoSetting('company_name', 'PT. Kenco Manufactur Indonesia');

    $response = $this->get('/');

    $response->assertInertia(fn ($page) => $page->where('seo.title', 'PT. Kenco Manufactur Indonesia'));
});

test('admin can save an og image for a product via an uploaded file', function () {
    Storage::fake('public');
    Permission::findOrCreate('products.create', 'web');
    $user = User::factory()->create();
    $user->givePermissionTo('products.create');

    $response = $this->actingAs($user)->post(route('admin.products.store'), [
        'name' => 'OG Image Product',
        'status' => 'draft',
        'seo' => [
            'og_image' => UploadedFile::fake()->image('og.jpg')->size(200),
        ],
    ]);

    $response->assertRedirect();
    $product = Product::where('name', 'OG Image Product')->firstOrFail();
    expect($product->seoMetadata->og_image)->not->toBeNull();
    Storage::disk('public')->assertExists($product->seoMetadata->og_image);
});

test('admin can save an og image for a product by selecting an existing media library path', function () {
    Permission::findOrCreate('products.create', 'web');
    $user = User::factory()->create();
    $user->givePermissionTo('products.create');

    $response = $this->actingAs($user)->post(route('admin.products.store'), [
        'name' => 'OG Path Product',
        'status' => 'draft',
        'seo' => [
            'og_image_path' => 'media/existing-og.jpg',
        ],
    ]);

    $response->assertRedirect();
    $product = Product::where('name', 'OG Path Product')->firstOrFail();
    expect($product->seoMetadata->og_image)->toBe('media/existing-og.jpg');
});
