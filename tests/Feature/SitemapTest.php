<?php

use App\Enums\ContentStatus;
use App\Models\Article;
use App\Models\JobVacancy;
use App\Models\Product;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    Cache::forget('sitemap.xml');
});

test('sitemap is valid xml and includes the homepage', function () {
    $response = $this->get('/sitemap.xml');

    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
    $this->assertStringContainsString('<urlset', $response->getContent());
    $this->assertStringContainsString('<loc>'.url('/').'</loc>', $response->getContent());
});

test('sitemap includes a published product but excludes a draft one', function () {
    Product::factory()->published()->create(['slug' => 'visible-product']);
    Product::factory()->create(['slug' => 'hidden-draft-product', 'status' => ContentStatus::Draft]);

    $response = $this->get('/sitemap.xml');

    $body = $response->getContent();
    $this->assertStringContainsString('/products/visible-product', $body);
    $this->assertStringNotContainsString('/products/hidden-draft-product', $body);
});

test('sitemap excludes archived articles', function () {
    Article::factory()->create(['slug' => 'archived-article', 'status' => ContentStatus::Archived]);

    $response = $this->get('/sitemap.xml');

    $this->assertStringNotContainsString('/news/archived-article', $response->getContent());
});

test('sitemap includes an open job vacancy but excludes a closed one', function () {
    JobVacancy::factory()->published()->create(['slug' => 'open-role', 'closes_at' => now()->addWeek()]);
    JobVacancy::factory()->published()->create(['slug' => 'closed-role', 'closes_at' => now()->subDay()]);

    $response = $this->get('/sitemap.xml');

    $body = $response->getContent();
    $this->assertStringContainsString('/careers/open-role', $body);
    $this->assertStringNotContainsString('/careers/closed-role', $body);
});

test('sitemap never contains admin, login, or preview routes', function () {
    $response = $this->get('/sitemap.xml');

    $body = $response->getContent();
    $this->assertStringNotContainsString('/admin', $body);
    $this->assertStringNotContainsString('/login', $body);
    $this->assertStringNotContainsString('preview', $body);
});
