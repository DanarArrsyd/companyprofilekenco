<?php

use App\Models\Certification;
use App\Models\Facility;
use App\Models\Industry;
use App\Models\Machine;
use App\Models\Media;
use App\Models\Product;
use App\Models\QualityContent;
use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Storage::fake('public');

    foreach ([
        'facilities.create',
        'industries.create',
        'certifications.create',
        'products.update',
        'settings.manage',
    ] as $permission) {
        Permission::findOrCreate($permission, 'web');
    }
});

function createMediaPathAdmin(string $permission): User
{
    $user = User::factory()->create();
    $user->givePermissionTo($permission);

    return $user;
}

test('facility accepts a media library path', function () {
    $user = createMediaPathAdmin('facilities.create');
    $media = Media::factory()->create(['path' => 'library/facility.jpg']);

    $this->actingAs($user)->post(route('admin.facilities.store'), [
        'name' => 'Path Facility',
        'status' => 'draft',
        'image_path' => $media->path,
    ])->assertRedirect();

    expect(Facility::where('name->en', 'Path Facility')->value('image'))->toBe($media->path);
});

test('machine accepts a media library path', function () {
    $user = createMediaPathAdmin('facilities.create');
    $media = Media::factory()->create(['path' => 'library/machine.jpg']);

    $this->actingAs($user)->post(route('admin.machines.store'), [
        'name' => 'Path Machine',
        'quantity' => 1,
        'status' => 'draft',
        'image_path' => $media->path,
    ])->assertRedirect();

    expect(Machine::where('name', 'Path Machine')->value('image'))->toBe($media->path);
});

test('industry accepts a media library path', function () {
    $user = createMediaPathAdmin('industries.create');
    $media = Media::factory()->create(['path' => 'library/industry.jpg']);

    $this->actingAs($user)->post(route('admin.industries.store'), [
        'name' => 'Path Industry',
        'status' => 'draft',
        'image_path' => $media->path,
    ])->assertRedirect();

    expect(Industry::where('name->en', 'Path Industry')->value('image'))->toBe($media->path);
});

test('quality content accepts a media library path', function () {
    $user = createMediaPathAdmin('certifications.create');
    $media = Media::factory()->create(['path' => 'library/quality.jpg']);

    $this->actingAs($user)->post(route('admin.quality-content.store'), [
        'title' => 'Path Quality',
        'status' => 'draft',
        'image_path' => $media->path,
    ])->assertRedirect();

    expect(QualityContent::where('title->en', 'Path Quality')->value('image'))->toBe($media->path);
});

test('certification accepts a media library path', function () {
    $user = createMediaPathAdmin('certifications.create');
    $media = Media::factory()->create(['path' => 'library/certification.jpg']);

    $this->actingAs($user)->post(route('admin.certifications.store'), [
        'name' => 'Path Certification',
        'status' => 'draft',
        'image_path' => $media->path,
    ])->assertRedirect();

    expect(Certification::where('name', 'Path Certification')->value('media_id'))->toBe($media->id);
});

test('settings accept media library paths', function () {
    $user = createMediaPathAdmin('settings.manage');
    $logo = Media::factory()->create(['path' => 'library/logo.png']);
    $ogImage = Media::factory()->create(['path' => 'library/default-og.jpg']);

    $this->actingAs($user)->put(route('admin.settings.update'), [
        'logo_path' => $logo->path,
        'seo_default_og_image_path' => $ogImage->path,
    ])->assertRedirect();

    $settings = app(SettingsService::class);
    expect($settings->get('logo'))->toBe($logo->path)
        ->and($settings->get('seo_default_og_image'))->toBe($ogImage->path);
});

test('product gallery accepts a media library path', function () {
    $user = createMediaPathAdmin('products.update');
    $product = Product::factory()->create();
    $media = Media::factory()->create(['path' => 'library/gallery.jpg']);
    Storage::disk('public')->put($media->path, 'shared image');

    $this->actingAs($user)->post(route('admin.products.images.store', $product), [
        'media_path' => $media->path,
        'alt_text' => 'Shared gallery image',
    ])->assertRedirect();

    $this->assertDatabaseHas('product_images', [
        'product_id' => $product->id,
        'media_id' => $media->id,
        'path' => $media->path,
        'alt_text' => 'Shared gallery image',
    ]);
    Storage::disk('public')->assertExists($media->path);
});
