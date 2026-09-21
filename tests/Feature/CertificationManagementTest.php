<?php

use App\Models\Certification;
use App\Models\Media;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    foreach (['certifications.view', 'certifications.create', 'certifications.update', 'certifications.delete'] as $permission) {
        Permission::findOrCreate($permission, 'web');
    }
});

test('admin can create a certification', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('certifications.create');

    $response = $this->actingAs($user)->post(route('admin.certifications.store'), [
        'name' => 'ISO 9001:2015',
        'issuer' => 'TUV Rheinland',
        'issued_at' => now()->subYear()->toDateString(),
        'expires_at' => now()->addYear()->toDateString(),
        'status' => 'published',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('certifications', ['name' => 'ISO 9001:2015']);
});

test('uploaded certification image becomes a reusable media library asset', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $user->givePermissionTo('certifications.create');

    $this->actingAs($user)->post(route('admin.certifications.store'), [
        'name' => 'Reusable Certificate',
        'status' => 'draft',
        'image' => UploadedFile::fake()->image('certificate.png'),
    ])->assertRedirect();

    $certification = Certification::where('name', 'Reusable Certificate')->firstOrFail();
    $media = Media::findOrFail($certification->media_id);

    expect($media->original_name)->toBe('certificate.png')
        ->and($media->mime_type)->toStartWith('image/')
        ->and($media->uploaded_by)->toBe($user->id);
    Storage::disk('public')->assertExists($media->path);
});

test('certification expiry date must be after or equal to issue date', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('certifications.create');

    $response = $this->actingAs($user)->post(route('admin.certifications.store'), [
        'name' => 'Bad Dates',
        'issued_at' => now()->toDateString(),
        'expires_at' => now()->subYear()->toDateString(),
        'status' => 'draft',
    ]);

    $response->assertSessionHasErrors('expires_at');
});

test('isExpired reflects whether the certification has passed its expiry date', function () {
    $expired = Certification::factory()->expired()->create();
    $active = Certification::factory()->create(['expires_at' => now()->addYear()]);

    expect($expired->isExpired())->toBeTrue()
        ->and($active->isExpired())->toBeFalse();
});

test('expired certifications remain visible to admins and are not auto-hidden', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('certifications.view');
    Certification::factory()->published()->expired()->create(['name' => 'Old Cert']);

    $response = $this->actingAs($user)->get(route('admin.certifications'));

    $response->assertInertia(fn ($page) => $page
        ->component('admin/certifications/Index')
        ->has('certifications.data', 1)
    );
});
