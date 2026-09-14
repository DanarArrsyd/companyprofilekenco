<?php

use App\Models\Article;
use App\Models\Capability;
use App\Models\Facility;
use App\Models\JobApplication;
use App\Models\JobVacancy;
use App\Models\Machine;
use App\Models\NewsCategory;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\SeoMetadata;

test('page has many page sections', function () {
    $page = Page::factory()->create();
    PageSection::factory()->count(2)->create(['page_id' => $page->id]);

    expect($page->sections)->toHaveCount(2);
});

test('product category has many products', function () {
    $category = ProductCategory::factory()->create();
    Product::factory()->count(3)->create(['product_category_id' => $category->id]);

    expect($category->products)->toHaveCount(3);
});

test('product has many product images and belongs to a category', function () {
    $category = ProductCategory::factory()->create();
    $product = Product::factory()->create(['product_category_id' => $category->id]);
    $media = \App\Models\Media::create(['disk' => 'public', 'path' => 'x.jpg', 'filename' => 'x.jpg']);

    $product->images()->create(['media_id' => $media->id, 'order' => 0, 'is_primary' => true]);

    expect($product->images)->toHaveCount(1)
        ->and($product->category->is($category))->toBeTrue();
});

test('facility has many machines', function () {
    $facility = Facility::factory()->create();
    Machine::factory()->count(2)->create(['facility_id' => $facility->id]);

    expect($facility->machines)->toHaveCount(2);
});

test('capability belongs to many machines', function () {
    $capability = Capability::factory()->create();
    $machine = Machine::factory()->create();

    $capability->machines()->attach($machine);

    expect($capability->machines)->toHaveCount(1)
        ->and($machine->capabilities()->first()->is($capability))->toBeTrue();
});

test('news category has many articles', function () {
    $category = NewsCategory::factory()->create();
    Article::factory()->count(2)->create(['news_category_id' => $category->id]);

    expect($category->articles)->toHaveCount(2);
});

test('job vacancy has many job applications', function () {
    $vacancy = JobVacancy::factory()->create();
    JobApplication::create([
        'job_vacancy_id' => $vacancy->id,
        'applicant_name' => 'Jane Doe',
        'applicant_email' => 'jane@example.com',
        'cv_path' => 'private/cv/jane.pdf',
    ]);

    expect($vacancy->applications)->toHaveCount(1);
});

test('seo metadata is polymorphic across content models', function () {
    $page = Page::factory()->create();
    $product = Product::factory()->create();
    $capability = Capability::factory()->create();
    $article = Article::factory()->create();
    $vacancy = JobVacancy::factory()->create();

    foreach ([$page, $product, $capability, $article, $vacancy] as $model) {
        $model->seoMetadata()->save(SeoMetadata::factory()->make());
    }

    expect($page->fresh()->seoMetadata)->toBeInstanceOf(SeoMetadata::class)
        ->and($product->fresh()->seoMetadata)->toBeInstanceOf(SeoMetadata::class)
        ->and($capability->fresh()->seoMetadata)->toBeInstanceOf(SeoMetadata::class)
        ->and($article->fresh()->seoMetadata)->toBeInstanceOf(SeoMetadata::class)
        ->and($vacancy->fresh()->seoMetadata)->toBeInstanceOf(SeoMetadata::class)
        ->and($page->fresh()->seoMetadata->seoable->is($page))->toBeTrue();
});
