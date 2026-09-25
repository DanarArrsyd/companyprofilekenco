<?php

use App\Enums\ContentStatus;
use App\Models\Article;
use App\Models\Facility;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

function publishingAdmin(): User
{
    test()->seed(RolePermissionSeeder::class);

    return tap(User::factory()->create())->assignRole('Super Admin');
}

test('publishing from the edit form without a date makes the content public right away', function () {
    $facility = Facility::factory()->create(['status' => ContentStatus::Draft, 'published_at' => null]);

    $this->actingAs(publishingAdmin())->put(route('admin.facilities.update', $facility), [
        'name' => $facility->name,
        'status' => 'published',
        'published_at' => '',
        'sort_order' => 0,
    ])->assertSessionHasNoErrors();

    $facility->refresh();

    expect($facility->published_at)->not->toBeNull()
        ->and($facility->isPublished())->toBeTrue();
});

test('creating published content without a date stamps the publish time', function () {
    $this->actingAs(publishingAdmin())->post(route('admin.news.store'), [
        'title' => 'Plant expansion',
        'content' => '<p>Body</p>',
        'status' => 'published',
        'published_at' => '',
    ])->assertSessionHasNoErrors();

    expect(Article::where('title->en', 'Plant expansion')->firstOrFail()->isPublished())->toBeTrue();
});

test('drafts keep an empty publish date and a chosen date is kept', function () {
    $draft = Article::factory()->create(['status' => ContentStatus::Draft, 'published_at' => null]);
    $scheduled = Article::factory()->create(['status' => ContentStatus::Published, 'published_at' => now()->addWeek()->startOfMinute()]);

    $draft->update(['title' => 'Draft title']);
    $scheduled->update(['title' => 'Scheduled title']);

    expect($draft->fresh()->published_at)->toBeNull()
        ->and($scheduled->fresh()->published_at->equalTo(now()->addWeek()->startOfMinute()))->toBeTrue();
});

test('clearing a translatable field stores null instead of an empty locale map', function () {
    $product = Product::factory()->create(['material' => 'Steel']);

    $product->update(['material' => null]);

    expect($product->fresh()->getRawOriginal('material'))->toBeNull();

    $product->update(['material' => 'Steel', 'translations' => ['id' => ['material' => 'Baja']]]);
    $product->update(['material' => null]);

    // The Indonesian text survives; only the empty English entry is dropped.
    expect(json_decode($product->fresh()->getRawOriginal('material'), true))->toBe(['id' => 'Baja']);
});
