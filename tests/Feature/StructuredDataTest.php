<?php

use App\Models\Article;
use App\Models\Capability;
use App\Models\JobVacancy;
use App\Models\NewsCategory;
use App\Models\Product;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    SiteSetting::updateOrCreate(['key' => 'company_name'], ['value' => 'PT. Kenco Manufactur Indonesia', 'type' => 'string']);
    Cache::forget('site_settings.all');
});

test('homepage exposes valid Organization and WebSite json-ld', function () {
    $response = $this->get('/');

    $response->assertInertia(function ($page) {
        $page->has('schema', 2);
        $schema = $page->toArray()['props']['schema'];

        expect($schema[0]['@type'])->toBe('Organization')
            ->and($schema[0]['name'])->toBe('PT. Kenco Manufactur Indonesia')
            ->and($schema[0]['url'])->toBe(url('/'))
            ->and($schema[1]['@type'])->toBe('WebSite');
    });
});

test('product detail exposes a breadcrumbList schema matching the visible breadcrumb', function () {
    $product = Product::factory()->published()->create(['name' => 'Flange Coupling', 'slug' => 'flange-coupling']);

    $response = $this->get('/products/flange-coupling');

    $response->assertInertia(function ($page) {
        $breadcrumb = $page->toArray()['props']['breadcrumb'];
        $schema = $page->toArray()['props']['schema'];

        expect($schema['@type'])->toBe('BreadcrumbList')
            ->and(count($schema['itemListElement']))->toBe(count($breadcrumb))
            ->and($schema['itemListElement'][0]['name'])->toBe('Produk')
            ->and($schema['itemListElement'][0]['item'])->toBe(url('/products'))
            ->and($schema['itemListElement'][0]['position'])->toBe(1)
            ->and(last($schema['itemListElement']))->not->toHaveKey('item');
    });

    $this->get('/en/products/flange-coupling')->assertInertia(function ($page) {
        $item = $page->toArray()['props']['schema']['itemListElement'][0];

        expect($item['name'])->toBe('Products')
            ->and($item['item'])->toBe(url('/en/products'));
    });
});

test('article detail exposes a valid NewsArticle schema shape with real fields only', function () {
    $category = NewsCategory::factory()->create();
    $article = Article::factory()->published()->create([
        'title' => 'Plant Expansion',
        'slug' => 'plant-expansion',
        'excerpt' => 'We expanded our plant.',
        'featured_image' => 'news/plant.jpg',
        'news_category_id' => $category->id,
    ]);

    $response = $this->get('/news/plant-expansion');

    $response->assertInertia(function ($page) {
        $schemas = $page->toArray()['props']['schema'];
        $articleSchema = collect($schemas)->firstWhere('@type', 'NewsArticle');

        expect($articleSchema)->not->toBeNull()
            ->and($articleSchema['headline'])->toBe('Plant Expansion')
            ->and($articleSchema['description'])->toBe('We expanded our plant.')
            ->and($articleSchema['datePublished'])->not->toBeNull()
            ->and($articleSchema['publisher']['@type'])->toBe('Organization')
            ->and($articleSchema['image'][0])->toContain('news/plant.jpg')
            ->and($articleSchema)->not->toHaveKey('author');
    });
});

test('open job vacancy with a description exposes a JobPosting schema', function () {
    JobVacancy::factory()->published()->create([
        'title' => 'Welder',
        'slug' => 'welder-open',
        'closes_at' => now()->addMonth(),
        'description' => 'Weld things safely.',
        'employment_type' => 'Full-time',
        'location' => 'Cikarang',
    ]);

    $response = $this->get('/careers/welder-open');

    $response->assertInertia(function ($page) {
        $schemas = $page->toArray()['props']['schema'];
        $jobSchema = collect($schemas)->firstWhere('@type', 'JobPosting');

        expect($jobSchema)->not->toBeNull()
            ->and($jobSchema['title'])->toBe('Welder')
            ->and($jobSchema['employmentType'])->toBe('FULL_TIME')
            ->and($jobSchema['jobLocation']['address']['addressLocality'])->toBe('Cikarang');
    });
});

test('closed job vacancy never exposes JobPosting schema', function () {
    $vacancy = JobVacancy::factory()->published()->create([
        'slug' => 'closed-vacancy-schema',
        'closes_at' => now()->subDay(),
        'description' => 'Some description.',
    ]);

    $response = $this->get('/careers/closed-vacancy-schema');

    $response->assertInertia(function ($page) {
        $schemas = $page->toArray()['props']['schema'];
        $jobSchema = collect($schemas)->firstWhere('@type', 'JobPosting');

        expect($jobSchema)->toBeNull();
    });
});

test('capability detail exposes a Service schema', function () {
    $capability = Capability::factory()->published()->create(['name' => 'CNC Machining', 'slug' => 'cnc-machining', 'summary' => 'Precision CNC work.']);

    $response = $this->get('/capabilities/cnc-machining');

    $response->assertInertia(function ($page) {
        $schemas = $page->toArray()['props']['schema'];
        $serviceSchema = collect($schemas)->firstWhere('@type', 'Service');

        expect($serviceSchema)->not->toBeNull()
            ->and($serviceSchema['name'])->toBe('CNC Machining')
            ->and($serviceSchema['provider']['@type'])->toBe('Organization');
    });
});
