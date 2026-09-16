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
    $this->assertDatabaseHas('articles', ['title' => 'New Production Line Launched', 'slug' => 'new-production-line-launched']);
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

    $article = Article::where('title', 'SEO Article')->firstOrFail();

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

test('public news detail page renders for a published article', function () {
    $article = Article::factory()->published()->create(['slug' => 'my-article']);

    $response = $this->get('/news/my-article');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/news/Show')
        ->where('article.id', $article->id)
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
