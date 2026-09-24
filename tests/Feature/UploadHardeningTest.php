<?php

use App\Models\Media;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Storage::fake('public');
    Permission::findOrCreate('media.manage', 'web');
});

/** A real temp file, so MIME sniffing reads the bytes rather than the name. */
function uploadWithContent(string $clientName, string $content): UploadedFile
{
    $path = tempnam(sys_get_temp_dir(), 'upl');
    file_put_contents($path, $content);

    return new UploadedFile($path, $clientName, null, null, true);
}

function mediaManager(): User
{
    $user = User::factory()->create();
    $user->givePermissionTo('media.manage');

    return $user;
}

test('a PDF disguised with an .html name is stored with its real extension', function () {
    // Valid PDF signature so content sniffing passes, but the client name asks
    // for .html — served from the public disk that would be same-origin HTML.
    $file = uploadWithContent('brochure.html', "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n<script>alert(document.cookie)</script>\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n");

    $this->actingAs(mediaManager())
        ->post(route('admin.media.store'), ['file' => $file])
        ->assertSessionHasNoErrors();

    $media = Media::query()->latest('id')->firstOrFail();

    expect(pathinfo($media->path, PATHINFO_EXTENSION))->toBe('pdf');
    Storage::disk('public')->assertMissing(preg_replace('/\.pdf$/', '.html', $media->path));
});

test('a real image uploaded under an .html name never keeps that extension', function () {
    $png = UploadedFile::fake()->image('seed.png', 20, 20);
    $file = uploadWithContent('photo.html', file_get_contents($png->getRealPath()));

    $this->actingAs(mediaManager())
        ->post(route('admin.media.store'), ['file' => $file])
        ->assertSessionHasNoErrors();

    $media = Media::query()->latest('id')->firstOrFail();

    expect(pathinfo($media->path, PATHINFO_EXTENSION))->toBeIn(['png', 'webp']);
});
