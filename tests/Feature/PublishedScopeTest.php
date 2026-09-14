<?php

use App\Enums\ContentStatus;
use App\Models\Article;
use App\Models\Capability;
use App\Models\Industry;
use App\Models\JobVacancy;
use App\Models\Page;
use App\Models\Product;

dataset('publishable_models', [
    'Page' => [Page::class],
    'Product' => [Product::class],
    'Capability' => [Capability::class],
    'Article' => [Article::class],
    'JobVacancy' => [JobVacancy::class],
    'Industry' => [Industry::class],
]);

test('published scope only returns published content in the past', function (string $model) {
    $model::factory()->create([
        'status' => ContentStatus::Published,
        'published_at' => now()->subDay(),
    ]);

    expect($model::published()->count())->toBe(1);
})->with('publishable_models');

test('draft content is not considered public', function (string $model) {
    $model::factory()->create([
        'status' => ContentStatus::Draft,
        'published_at' => now()->subDay(),
    ]);

    expect($model::published()->count())->toBe(0);
})->with('publishable_models');

test('archived content is not considered public', function (string $model) {
    $model::factory()->create([
        'status' => ContentStatus::Archived,
        'published_at' => now()->subDay(),
    ]);

    expect($model::published()->count())->toBe(0);
})->with('publishable_models');

test('content with a future published_at is not considered public', function (string $model) {
    $model::factory()->create([
        'status' => ContentStatus::Published,
        'published_at' => now()->addDay(),
    ]);

    expect($model::published()->count())->toBe(0);
})->with('publishable_models');

test('isPublished reflects the same rule as the published scope', function () {
    $published = Page::factory()->published()->create();
    $draft = Page::factory()->create();
    $futurePublished = Page::factory()->create([
        'status' => ContentStatus::Published,
        'published_at' => now()->addWeek(),
    ]);

    expect($published->isPublished())->toBeTrue()
        ->and($draft->isPublished())->toBeFalse()
        ->and($futurePublished->isPublished())->toBeFalse();
});
