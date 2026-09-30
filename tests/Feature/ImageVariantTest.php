<?php

use App\Enums\PageType;
use App\Models\PageSection;
use App\Services\ImageVariantService;
use App\Services\MediaUploadService;
use Database\Seeders\DemoContentSeeder;
use Illuminate\Support\Facades\Storage;

function storeTestImage(string $path, int $width, int $height, string $format = 'png'): void
{
    $image = imagecreatetruecolor($width, $height);
    imagefill($image, 0, 0, imagecolorallocate($image, 20, 60, 120));
    ob_start();
    $format === 'jpg' ? imagejpeg($image) : imagepng($image);
    Storage::disk('public')->put($path, ob_get_clean());
    imagedestroy($image);
}

beforeEach(function () {
    Storage::fake('public');
});

test('a variant is built as a scaled-down WebP and saved at its public address', function () {
    storeTestImage('library/photo.png', 1200, 600);

    $response = $this->get('/storage/_variants/v2/w480/library/photo.png.webp');

    $response->assertOk()->assertHeader('Content-Type', 'image/webp');
    expect($response->headers->get('Set-Cookie'))->toBeNull();

    $saved = Storage::disk('public')->path('_variants/v2/w480/library/photo.png.webp');
    [$width, $height] = getimagesize($saved);
    expect([$width, $height])->toBe([480, 240]);
});

test('a source narrower than the requested width is never upscaled', function () {
    storeTestImage('library/small.jpg', 300, 200, 'jpg');

    $this->get('/storage/_variants/v2/w960/library/small.jpg.webp')->assertOk();

    expect(getimagesize(Storage::disk('public')->path('_variants/v2/w960/library/small.jpg.webp'))[0])->toBe(300);
});

test('unknown widths, missing sources and unsafe paths are 404', function (string $url) {
    storeTestImage('library/photo.png', 800, 400);

    $this->get($url)->assertNotFound();
})->with([
    'width not offered' => '/storage/_variants/v2/w500/library/photo.png.webp',
    'missing source' => '/storage/_variants/v2/w480/library/nope.png.webp',
    'not an image' => '/storage/_variants/v2/w480/library/notes.txt.webp',
    'variant of a variant' => '/storage/_variants/v2/w480/_variants/v2/w960/library/photo.png.webp.webp',
    'parent directory' => '/storage/_variants/v2/w480/library/../library/photo.png.webp',
]);

test('replacing or deleting a stored image drops its variants', function () {
    storeTestImage('library/photo.png', 1200, 600);
    $variants = app(ImageVariantService::class);
    $variants->ensure('library/photo.png', 480);
    Storage::disk('public')->assertExists('_variants/v2/w480/library/photo.png.webp');

    app(MediaUploadService::class)->deletePublic('library/photo.png');

    Storage::disk('public')->assertMissing('_variants/v2/w480/library/photo.png.webp');
});

test('the private disk has no public storage route', function () {
    Storage::fake('local');
    Storage::disk('local')->put('cv/secret.pdf', 'x');

    $this->get('/storage/cv/secret.pdf')->assertNotFound();
});

test('the homepage head preloads the hero photo with the same srcset the page uses', function () {
    $this->seed(DemoContentSeeder::class);
    $hero = PageSection::where('section_type', 'hero')
        ->whereHas('page', fn ($q) => $q->where('page_type', PageType::Homepage))
        ->firstOrFail();
    $hero->update(['content' => array_merge((array) $hero->getRawOriginal('content') ? json_decode($hero->getRawOriginal('content'), true) : [], ['image' => 'library/hero.jpg'])]);

    $html = $this->get('/')->assertOk()->getContent();

    expect($html)->toContain('imagesrcset="/storage/_variants/v2/w480/library/hero.jpg.webp 480w, /storage/_variants/v2/w960/library/hero.jpg.webp 960w')
        ->toContain('imagesizes="100vw"');
});

test('pages without a hero photo get no hero preload', function () {
    $this->get('/contact')->assertOk()->assertDontSee('imagesrcset', false);
});

test('media:variants builds every missing copy once', function () {
    storeTestImage('library/photo.png', 1200, 600);
    Storage::disk('public')->put('library/readme.txt', 'x');

    $this->artisan('media:variants')->expectsOutputToContain('1 images checked, 4 copies built')->assertSuccessful();
    $this->artisan('media:variants')->expectsOutputToContain('1 images checked, 0 copies built')->assertSuccessful();

    Storage::disk('public')->assertExists('_variants/v2/w2000/library/photo.png.webp');
});

test('media:variants drops copies from other encoder versions', function () {
    storeTestImage('library/photo.png', 1200, 600);
    Storage::disk('public')->put('_variants/w480/library/photo.png.webp', 'unversioned');
    Storage::disk('public')->put('_variants/v1/w480/library/photo.png.webp', 'old');
    Storage::disk('public')->put('_variants/VERSION', '2');

    $this->artisan('media:variants')->expectsOutputToContain('Removed outdated copies')->assertSuccessful();

    Storage::disk('public')->assertMissing(['_variants/w480', '_variants/v1', '_variants/VERSION']);
    Storage::disk('public')->assertExists('_variants/v2/w480/library/photo.png.webp');
    $this->artisan('media:variants')->doesntExpectOutputToContain('Removed')->assertSuccessful();
});
