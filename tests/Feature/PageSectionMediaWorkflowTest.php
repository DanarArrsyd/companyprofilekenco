<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Storage::fake('public');
    Permission::findOrCreate('media.manage', 'web');
});

function createPageSectionMediaAdmin(): User
{
    $user = User::factory()->create();
    $user->givePermissionTo('media.manage');

    return $user;
}

test('media upload returns the selected path to the picker', function () {
    $user = createPageSectionMediaAdmin();

    $response = $this->actingAs($user)
        ->postJson(route('admin.media.store'), [
            'file' => UploadedFile::fake()->image('section.jpg', 1200, 800),
        ]);

    $response->assertCreated()
        ->assertJsonStructure(['id', 'path', 'url']);
    expect($response->json('path'))->toStartWith('library/');
});

test('media picker receives the file validation error', function () {
    $user = createPageSectionMediaAdmin();

    $this->actingAs($user)
        ->postJson(route('admin.media.store'), [
            'file' => UploadedFile::fake()->create('payload.exe', 10, 'application/octet-stream'),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('file');
});
