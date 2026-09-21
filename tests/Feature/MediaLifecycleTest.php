<?php

use App\Actions\Article\UpdateArticle;
use App\Actions\Capability\UpdateCapability;
use App\Actions\Product\DeleteProductImage;
use App\Actions\Product\UpdateProduct;
use App\Models\Article;
use App\Models\Capability;
use App\Models\Certification;
use App\Models\Customer;
use App\Models\Facility;
use App\Models\Industry;
use App\Models\Machine;
use App\Models\Media;
use App\Models\Milestone;
use App\Models\PageSection;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\QualityContent;
use App\Models\SeoMetadata;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Storage::fake('public');
    Permission::findOrCreate('media.manage', 'web');
});

function createMediaLifecycleAdmin(): User
{
    $user = User::factory()->create();
    $user->givePermissionTo('media.manage');

    return $user;
}

function assertMediaDeletionBlocked(Model $reference, Media $media): void
{
    test()->actingAs(createMediaLifecycleAdmin())
        ->delete(route('admin.media.destroy', $media))
        ->assertSessionHas('error');

    test()->assertDatabaseHas('media', ['id' => $media->id]);
    expect($reference->exists)->toBeTrue();
}

test('page section media cannot be deleted', function () {
    $media = Media::factory()->create(['path' => 'library/shared.jpg']);
    $section = PageSection::factory()->create([
        'content' => ['cards' => [['image' => $media->path]]],
    ]);

    assertMediaDeletionBlocked($section, $media);
});

test('direct public image references prevent media deletion', function (string $modelClass, string $column) {
    $media = Media::factory()->create(['path' => 'library/shared.jpg']);
    $reference = $modelClass::factory()->create([$column => $media->path]);

    assertMediaDeletionBlocked($reference, $media);
})->with([
    'product' => [Product::class, 'featured_image'],
    'article' => [Article::class, 'featured_image'],
    'capability' => [Capability::class, 'featured_image'],
    'facility' => [Facility::class, 'image'],
    'machine' => [Machine::class, 'image'],
    'industry' => [Industry::class, 'image'],
    'milestone' => [Milestone::class, 'image'],
    'quality content' => [QualityContent::class, 'image'],
]);

test('SEO image media cannot be deleted', function () {
    $media = Media::factory()->create(['path' => 'library/shared.jpg']);
    $product = Product::factory()->create();
    $reference = $product->seoMetadata()->save(
        SeoMetadata::factory()->make(['og_image' => $media->path]),
    );

    assertMediaDeletionBlocked($reference, $media);
});

test('certification media reference prevents deletion', function () {
    $media = Media::factory()->create(['path' => 'library/shared.jpg']);
    $reference = Certification::factory()->create(['media_id' => $media->id]);

    assertMediaDeletionBlocked($reference, $media);
});

test('product gallery and customer logo media references prevent deletion', function (string $modelClass, string $foreignKey, string $parentKey) {
    $media = Media::factory()->create(['path' => 'library/shared.jpg']);
    $attributes = [$foreignKey => $media->id];

    if ($modelClass === ProductImage::class) {
        $attributes['product_id'] = Product::factory()->create()->id;
    }

    $reference = $modelClass::create([...$attributes, $parentKey => 'Shared asset']);

    assertMediaDeletionBlocked($reference, $media);
})->with([
    'product gallery' => [ProductImage::class, 'media_id', 'alt_text'],
    'customer logo' => [Customer::class, 'logo_media_id', 'name'],
]);

test('site setting media cannot be deleted', function () {
    $media = Media::factory()->create(['path' => 'library/shared.jpg']);
    $setting = SiteSetting::create([
        'key' => 'logo',
        'value' => $media->path,
        'type' => 'image',
    ]);

    assertMediaDeletionBlocked($setting, $media);
});

test('replacing a product image preserves its previous library file', function () {
    $media = Media::factory()->create(['path' => 'library/shared.jpg']);
    Storage::disk('public')->put($media->path, 'shared');
    $product = Product::factory()->create(['featured_image' => $media->path]);

    app(UpdateProduct::class)->handle($product, [
        'name' => $product->name,
        'status' => 'draft',
        'featured_image' => UploadedFile::fake()->image('replacement.jpg'),
        'seo' => [],
    ]);

    Storage::disk('public')->assertExists($media->path);
});

test('replacing article and capability images preserves library files', function (string $actionClass, string $modelClass, string $nameColumn) {
    $media = Media::factory()->create(['path' => 'library/shared.jpg']);
    Storage::disk('public')->put($media->path, 'shared');
    $model = $modelClass::factory()->create(['featured_image' => $media->path]);

    app($actionClass)->handle($model, [
        $nameColumn => $model->{$nameColumn},
        'status' => 'draft',
        'featured_image' => UploadedFile::fake()->image('replacement.jpg'),
        'seo' => [],
    ]);

    Storage::disk('public')->assertExists($media->path);
})->with([
    'article' => [UpdateArticle::class, Article::class, 'title'],
    'capability' => [UpdateCapability::class, Capability::class, 'name'],
]);

test('replacing or removing a milestone image preserves its library file', function (bool $removeImage) {
    Permission::findOrCreate('milestones.update', 'web');
    $user = User::factory()->create();
    $user->givePermissionTo('milestones.update');

    $media = Media::factory()->create(['path' => 'library/shared.jpg']);
    Storage::disk('public')->put($media->path, 'shared');
    $milestone = Milestone::factory()->create(['image' => $media->path]);

    $payload = [
        'year' => $milestone->year,
        'title' => $milestone->title,
        'order' => $milestone->order,
    ];
    $payload[$removeImage ? 'remove_image' : 'image'] = $removeImage
        ? true
        : UploadedFile::fake()->image('replacement.jpg');

    $this->actingAs($user)
        ->put(route('admin.milestones.update', $milestone), $payload)
        ->assertRedirect();

    Storage::disk('public')->assertExists($media->path);
})->with([
    'replace' => [false],
    'remove' => [true],
]);

test('replacing an unmanaged product image deletes the previous file', function () {
    $oldPath = 'products/old.jpg';
    Storage::disk('public')->put($oldPath, 'old');
    $product = Product::factory()->create(['featured_image' => $oldPath]);

    app(UpdateProduct::class)->handle($product, [
        'name' => $product->name,
        'status' => 'draft',
        'featured_image' => UploadedFile::fake()->image('replacement.jpg'),
        'seo' => [],
    ]);

    Storage::disk('public')->assertMissing($oldPath);
});

test('selecting a library image deletes only the previous unmanaged product file', function () {
    $oldPath = 'products/old.jpg';
    Storage::disk('public')->put($oldPath, 'old');
    $product = Product::factory()->create(['featured_image' => $oldPath]);
    $libraryMedia = Media::factory()->create(['path' => 'library/replacement.jpg']);

    app(UpdateProduct::class)->handle($product, [
        'name' => $product->name,
        'status' => 'draft',
        'featured_image_path' => $libraryMedia->path,
        'seo' => [],
    ]);

    Storage::disk('public')->assertMissing($oldPath);
    expect($product->fresh()->featured_image)->toBe($libraryMedia->path);
});

test('reselecting the current unmanaged product path does not delete its file', function () {
    $path = 'products/current.jpg';
    Storage::disk('public')->put($path, 'current');
    $product = Product::factory()->create(['featured_image' => $path]);

    app(UpdateProduct::class)->handle($product, [
        'name' => $product->name,
        'status' => 'draft',
        'featured_image_path' => $path,
        'seo' => [],
    ]);

    Storage::disk('public')->assertExists($path);
});

test('clearing an unmanaged product image removes its file and reference', function () {
    $path = 'products/current.jpg';
    Storage::disk('public')->put($path, 'current');
    $product = Product::factory()->create(['featured_image' => $path]);

    app(UpdateProduct::class)->handle($product, [
        'name' => $product->name,
        'status' => 'draft',
        'featured_image_path' => null,
        'seo' => [],
    ]);

    Storage::disk('public')->assertMissing($path);
    expect($product->fresh()->featured_image)->toBeNull();
});

test('deleting a product gallery reference preserves its media library file', function () {
    $media = Media::factory()->create(['path' => 'library/gallery.jpg']);
    Storage::disk('public')->put($media->path, 'shared');
    $image = ProductImage::create([
        'product_id' => Product::factory()->create()->id,
        'media_id' => $media->id,
        'path' => $media->path,
        'order' => 0,
    ]);

    app(DeleteProductImage::class)->handle($image);

    Storage::disk('public')->assertExists($media->path);
    $this->assertDatabaseMissing('product_images', ['id' => $image->id]);
});
