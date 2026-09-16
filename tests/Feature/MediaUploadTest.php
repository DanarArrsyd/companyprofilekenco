<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Storage::fake('public');
    Permission::findOrCreate('products.create', 'web');
});

test('invalid mime type is rejected for a featured image upload', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('products.create');

    $response = $this->actingAs($user)->post(route('admin.products.store'), [
        'name' => 'Bad Upload Product',
        'status' => 'draft',
        'featured_image' => UploadedFile::fake()->create('malware.exe', 100, 'application/x-msdownload'),
        'seo' => [],
    ]);

    $response->assertSessionHasErrors('featured_image');
});

test('oversized image upload is rejected', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('products.create');

    $response = $this->actingAs($user)->post(route('admin.products.store'), [
        'name' => 'Oversized Product',
        'status' => 'draft',
        'featured_image' => UploadedFile::fake()->image('big.jpg')->size(6000),
        'seo' => [],
    ]);

    $response->assertSessionHasErrors('featured_image');
});

test('valid image upload is accepted and stored', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('products.create');

    $response = $this->actingAs($user)->post(route('admin.products.store'), [
        'name' => 'Valid Upload Product',
        'status' => 'draft',
        'featured_image' => UploadedFile::fake()->image('product.jpg')->size(500),
        'seo' => [],
    ]);

    $response->assertRedirect();
    $product = \App\Models\Product::where('name', 'Valid Upload Product')->firstOrFail();
    expect($product->featured_image)->not->toBeNull();
    Storage::disk('public')->assertExists($product->featured_image);
});
