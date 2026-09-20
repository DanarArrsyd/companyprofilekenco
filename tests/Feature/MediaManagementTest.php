<?php

use App\Models\Article;
use App\Models\Media;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Storage::fake('public');
    Permission::findOrCreate('media.manage', 'web');
});

function createMediaAdmin(): User
{
    $user = User::factory()->create();
    $user->givePermissionTo('media.manage');

    return $user;
}

test('authorized user can view the media library', function () {
    $user = createMediaAdmin();

    $this->actingAs($user)->get(route('admin.media'))->assertOk();
});

test('unauthorized user is denied access to the media library', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('admin.media'))->assertForbidden();
});

test('valid image upload is accepted and creates a media record', function () {
    $user = createMediaAdmin();

    $response = $this->actingAs($user)->post(route('admin.media.store'), [
        'file' => UploadedFile::fake()->image('photo.jpg', 400, 300)->size(500),
        'alt_text' => 'A test photo',
    ]);

    $response->assertRedirect();
    $media = Media::where('original_name', 'photo.jpg')->firstOrFail();
    expect($media->width)->toBe(400)->and($media->height)->toBe(300);
    Storage::disk('public')->assertExists($media->path);
});

test('invalid mime type is rejected', function () {
    $user = createMediaAdmin();

    $response = $this->actingAs($user)->post(route('admin.media.store'), [
        'file' => UploadedFile::fake()->create('malware.exe', 100, 'application/x-msdownload'),
    ]);

    $response->assertSessionHasErrors('file');
});

test('media not referenced by content can be deleted', function () {
    $user = createMediaAdmin();
    $media = Media::factory()->create();

    $response = $this->actingAs($user)->delete(route('admin.media.destroy', $media));

    $response->assertRedirect();
    $this->assertDatabaseMissing('media', ['id' => $media->id]);
});

test('media still referenced by content cannot be deleted', function () {
    $user = createMediaAdmin();
    $media = Media::factory()->create();
    Article::factory()->create(['featured_image' => $media->path]);

    $response = $this->actingAs($user)->delete(route('admin.media.destroy', $media));

    $response->assertRedirect()->assertSessionHas('error');
    $this->assertDatabaseHas('media', ['id' => $media->id]);
});

test('alt text can be updated', function () {
    $user = createMediaAdmin();
    $media = Media::factory()->create(['alt_text' => 'Old text']);

    $response = $this->actingAs($user)->put(route('admin.media.alt-text', $media), ['alt_text' => 'New text']);

    $response->assertRedirect();
    expect($media->fresh()->alt_text)->toBe('New text');
});

test('private CV uploads never appear in the media library', function () {
    $user = createMediaAdmin();
    Media::factory()->create(['original_name' => 'public-asset.jpg']);

    $response = $this->actingAs($user)->get(route('admin.media'));

    $response->assertInertia(fn ($page) => $page
        ->component('admin/media/Index')
        ->has('media.data', 1)
    );
});

test('picker response includes pagination and usage count', function () {
    $user = createMediaAdmin();
    $media = Media::factory()->create(['path' => 'library/used.jpg', 'mime_type' => 'image/jpeg']);
    Article::factory()->create(['featured_image' => $media->path]);

    $this->actingAs($user)
        ->getJson(route('admin.media.picker', ['type' => 'image']))
        ->assertOk()
        ->assertJsonPath('data.0.usage_count', 1)
        ->assertJsonStructure(['current_page', 'last_page', 'data']);
});

test('media library response includes asset usages', function () {
    $user = createMediaAdmin();
    $media = Media::factory()->create(['path' => 'library/used.jpg']);
    $article = Article::factory()->create([
        'title' => 'Shared image article',
        'featured_image' => $media->path,
    ]);

    $this->actingAs($user)
        ->get(route('admin.media'))
        ->assertInertia(fn ($page) => $page
            ->where('media.data.0.usage_count', 1)
            ->where('media.data.0.usages.0.type', 'article')
            ->where('media.data.0.usages.0.id', $article->id)
            ->where('media.data.0.usages.0.label', 'Shared image article')
        );
});
