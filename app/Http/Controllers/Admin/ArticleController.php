<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Article\ArchiveArticle;
use App\Actions\Article\CreateArticle;
use App\Actions\Article\DeleteArticle;
use App\Actions\Article\PublishArticle;
use App\Actions\Article\RestoreArticle;
use App\Actions\Article\UpdateArticle;
use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Article\StoreArticleRequest;
use App\Http\Requests\Admin\Article\UpdateArticleRequest;
use App\Models\Article;
use App\Models\NewsCategory;
use App\Services\SeoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(Request $request): Response
    {
        $trashed = $request->boolean('trashed');

        $articles = Article::query()
            ->with(['category:id,name', 'author:id,name'])
            ->when($trashed, fn ($q) => $q->onlyTrashed())
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', "%{$request->string('search')}%"))
            ->when($request->filled('category'), fn ($q) => $q->where('news_category_id', $request->integer('category')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->boolean('featured'), fn ($q) => $q->where('is_featured', true))
            ->latest('updated_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/news/Index', [
            'articles' => $articles,
            'filters' => $request->only(['search', 'category', 'status', 'featured', 'trashed']),
            'categories' => NewsCategory::orderBy('name')->get(['id', 'name']),
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/news/Create', [
            'categories' => NewsCategory::orderBy('name')->get(['id', 'name']),
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function store(StoreArticleRequest $request, CreateArticle $action): RedirectResponse
    {
        $article = $action->handle($request->validated());

        return redirect()->route('admin.news.edit', $article)->with('success', 'Article created.');
    }

    public function edit(Article $article): Response
    {
        $article->load(['seoMetadata', 'category:id,name', 'author:id,name']);

        return Inertia::render('admin/news/Edit', [
            'article' => $article,
            'categories' => NewsCategory::orderBy('name')->get(['id', 'name']),
            'statusOptions' => array_map(fn ($c) => $c->value, ContentStatus::cases()),
        ]);
    }

    public function update(UpdateArticleRequest $request, Article $article, UpdateArticle $action): RedirectResponse
    {
        $action->handle($article, $request->validated());

        return back()->with('success', 'Article updated.');
    }

    public function publish(Article $article, PublishArticle $action): RedirectResponse
    {
        $action->handle($article);

        return back()->with('success', 'Article published.');
    }

    public function archive(Article $article, ArchiveArticle $action): RedirectResponse
    {
        $action->handle($article);

        return back()->with('success', 'Article archived.');
    }

    public function destroy(Article $article, DeleteArticle $action): RedirectResponse
    {
        $action->handle($article);

        return redirect()->route('admin.news')->with('success', 'Article moved to trash.');
    }

    public function restore(int $article, RestoreArticle $action): RedirectResponse
    {
        $action->handle(Article::onlyTrashed()->findOrFail($article));

        return back()->with('success', 'Article restored.');
    }

    public function preview(Article $article, SeoService $seo): Response
    {
        $article->load(['category:id,name,slug', 'author:id,name']);

        return Inertia::render('public/news/Show', [
            'article' => $article,
            'relatedArticles' => [],
            'seo' => $seo->preview($article->title),
            'breadcrumb' => [
                ['label' => 'News', 'href' => '/news'],
                ...($article->category ? [['label' => $article->category->name, 'href' => "/news?category={$article->category->slug}"]] : []),
                ['label' => $article->title],
            ],
            'preview' => true,
        ]);
    }
}
