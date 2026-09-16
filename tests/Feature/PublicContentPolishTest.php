<?php

use App\Models\Article;
use App\Models\JobVacancy;
use App\Models\NewsCategory;
use App\Models\SiteSetting;

test('article detail exposes featured image and category for the redesigned editorial layout', function () {
    $category = NewsCategory::factory()->create(['name' => 'Company News']);
    $article = Article::factory()->published()->create([
        'slug' => 'plant-expansion',
        'featured_image' => 'news/plant-expansion.jpg',
        'news_category_id' => $category->id,
    ]);

    $response = $this->get('/news/plant-expansion');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/news/Show')
        ->where('article.id', $article->id)
        ->where('article.featured_image', 'news/plant-expansion.jpg')
        ->where('article.category.name', 'Company News')
    );
});

test('related articles carry featured image and category so the editorial preview renders correctly', function () {
    $category = NewsCategory::factory()->create();
    $article = Article::factory()->published()->create(['news_category_id' => $category->id]);
    Article::factory()->published()->create([
        'news_category_id' => $category->id,
        'featured_image' => 'news/related.jpg',
    ]);

    $response = $this->get("/news/{$article->slug}");

    $response->assertInertia(fn ($page) => $page
        ->has('relatedArticles.0.featured_image')
    );
});

test('a published but closed vacancy still renders its detail page without an apply form being usable', function () {
    $vacancy = JobVacancy::factory()->published()->create([
        'slug' => 'closed-role',
        'closes_at' => now()->subDay(),
    ]);

    $response = $this->get('/careers/closed-role');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/careers/Show')
        ->where('vacancy.id', $vacancy->id)
    );
    expect($vacancy->isOpen())->toBeFalse();
});

test('contact page shares site settings for the info panel', function () {
    SiteSetting::create(['key' => 'address', 'value' => 'Jl. Industri No. 1, Cikarang', 'type' => 'text']);
    SiteSetting::create(['key' => 'phone', 'value' => '+62 21 5551234', 'type' => 'string']);
    SiteSetting::create(['key' => 'email', 'value' => 'hello@kenco.test', 'type' => 'string']);

    $response = $this->get('/contact');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/contact/Index')
        ->where('siteSettings.address', 'Jl. Industri No. 1, Cikarang')
        ->where('siteSettings.phone', '+62 21 5551234')
        ->where('siteSettings.email', 'hello@kenco.test')
    );
});

test('contact page renders without error when no map or contact settings are configured', function () {
    $response = $this->get('/contact');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/contact/Index')
        ->where('siteSettings.map_embed_url', null)
    );
});
