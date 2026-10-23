<?php

use App\Enums\ContentStatus;
use App\Models\Article;
use App\Models\NewsCategory;
use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    foreach (['news.view', 'news.create', 'news.update', 'news.delete'] as $permission) {
        Permission::findOrCreate($permission, 'web');
    }
});

function createNewsAdmin(array $permissions): User
{
    $user = User::factory()->create();
    $user->givePermissionTo($permissions);

    return $user;
}

test('authorized admin can view the article list', function () {
    $user = createNewsAdmin(['news.view']);

    $this->actingAs($user)->get(route('admin.news'))->assertOk();
});

test('unauthorized user is denied access to the article list', function () {
    $user = createNewsAdmin([]);

    $this->actingAs($user)->get(route('admin.news'))->assertForbidden();
});

test('admin can create an article', function () {
    $user = createNewsAdmin(['news.create']);
    $category = NewsCategory::factory()->create();

    $response = $this->actingAs($user)->post(route('admin.news.store'), [
        'news_category_id' => $category->id,
        'title' => 'New Production Line Launched',
        'status' => 'draft',
        'seo' => [],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('articles', ['title->en' => 'New Production Line Launched', 'slug' => 'new-production-line-launched']);
});

test('article slug must be unique', function () {
    $user = createNewsAdmin(['news.create']);
    Article::factory()->create(['slug' => 'company-milestone']);

    $response = $this->actingAs($user)->post(route('admin.news.store'), [
        'title' => 'Company Milestone Duplicate',
        'slug' => 'company-milestone',
        'status' => 'draft',
        'seo' => [],
    ]);

    $response->assertSessionHasErrors('slug');
});

test('draft article is not publicly accessible', function () {
    Article::factory()->create(['slug' => 'draft-article', 'status' => ContentStatus::Draft]);

    $this->get('/news/draft-article')->assertNotFound();
});

test('published article is publicly accessible', function () {
    Article::factory()->published()->create(['slug' => 'published-article']);

    $this->get('/news/published-article')->assertOk();
});

test('archived article is not publicly accessible', function () {
    Article::factory()->archived()->create(['slug' => 'archived-article']);

    $this->get('/news/archived-article')->assertNotFound();
});

test('article with future published_at is not publicly accessible', function () {
    Article::factory()->create([
        'slug' => 'future-article',
        'status' => ContentStatus::Published,
        'published_at' => now()->addWeek(),
    ]);

    $this->get('/news/future-article')->assertNotFound();
});

test('article has polymorphic seo metadata', function () {
    $user = createNewsAdmin(['news.create']);

    $this->actingAs($user)->post(route('admin.news.store'), [
        'title' => 'SEO Article',
        'status' => 'draft',
        'seo' => ['meta_title' => 'Custom SEO Title'],
    ]);

    $article = Article::where('title->en', 'SEO Article')->firstOrFail();

    expect($article->seoMetadata)->not->toBeNull()
        ->and($article->seoMetadata->meta_title)->toBe('Custom SEO Title');
});

test('public news listing shows only published articles', function () {
    Article::factory()->published()->create(['title' => 'Visible Article']);
    Article::factory()->create(['title' => 'Hidden Draft']);

    $response = $this->get('/news');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/news/Index')
        ->has('articles.data', 1)
        ->where('articles.data.0.title', 'Visible Article')
    );
});

test('public news feature and article list stay inside the selected category', function () {
    $companyNews = NewsCategory::factory()->create(['name' => 'Company News', 'slug' => 'company-news']);
    $otherNews = NewsCategory::factory()->create(['name' => 'Other News', 'slug' => 'other-news']);

    $companyArticle = Article::factory()->published()->create([
        'news_category_id' => $companyNews->id,
        'title' => 'Company article',
        'published_at' => now()->subDays(3),
    ]);
    Article::factory()->published()->create([
        'news_category_id' => $otherNews->id,
        'title' => 'Other featured article',
        'is_featured' => true,
        'published_at' => now()->subDay(),
    ]);

    $this->get('/en/news?category=company-news')->assertOk()->assertInertia(fn ($page) => $page
        ->component('public/news/Index')
        ->where('featuredArticle.id', $companyArticle->id)
        ->has('articles.data', 1)
        ->where('articles.data.0.id', $companyArticle->id)
        ->where('filters.category', 'company-news')
    );
});

test('public news list filters by year and search and sorts oldest first', function () {
    $category = NewsCategory::factory()->create();
    $older = Article::factory()->published()->create([
        'news_category_id' => $category->id,
        'title' => 'Factory opened',
        'published_at' => '2024-02-15 12:00:00',
    ]);
    $newer = Article::factory()->published()->create([
        'news_category_id' => $category->id,
        'title' => 'Factory expanded',
        'published_at' => '2024-08-15 12:00:00',
    ]);
    Article::factory()->published()->create([
        'news_category_id' => $category->id,
        'title' => 'Factory upgraded',
        'published_at' => '2025-02-15 12:00:00',
    ]);

    $this->get('/news?year=2024&sort=oldest&search=Factory')->assertOk()->assertInertia(fn ($page) => $page
        ->component('public/news/Index')
        ->has('articles.data', 2)
        ->where('articles.data.0.id', $older->id)
        ->where('articles.data.1.id', $newer->id)
        ->where('filters.sort', 'oldest')
        ->where('filters.search', 'Factory')
    );
});

test('public news detail page renders for a published article', function () {
    $article = Article::factory()->published()->create([
        'slug' => 'my-article',
        'content' => '<p>'.str_repeat('quality ', 401).'</p>',
    ]);

    $response = $this->get('/news/my-article');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/news/Show')
        ->where('article.id', $article->id)
        ->where('readingMinutes', 3)
        ->where('breadcrumb.0.href', '/')
    );
});

test('admin article preview uses the same reading layout data', function () {
    $user = createNewsAdmin(['news.view']);
    $article = Article::factory()->create(['content' => '<p>Preview text</p>']);

    $this->actingAs($user)->get(route('admin.news.preview', $article))->assertOk()->assertInertia(fn ($page) => $page
        ->component('public/news/Show')
        ->where('preview', true)
        ->where('readingMinutes', 1)
        ->where('breadcrumb.0.href', '/')
    );
});

test('admin can delete an article and restore it', function () {
    $user = createNewsAdmin(['news.delete']);
    $article = Article::factory()->create();

    $this->actingAs($user)->delete(route('admin.news.destroy', $article))->assertRedirect();
    $this->assertSoftDeleted('articles', ['id' => $article->id]);

    $this->actingAs($user)->post(route('admin.news.restore', $article->id))->assertRedirect();
    expect($article->fresh()->trashed())->toBeFalse();
});
