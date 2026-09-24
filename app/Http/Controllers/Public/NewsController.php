<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\NewsCategory;
use App\Services\SeoService;
use App\Services\StructuredDataService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NewsController extends Controller
{
    public function __construct(
        private readonly SeoService $seo,
        private readonly StructuredDataService $structuredData,
    ) {}

    public function index(Request $request): Response
    {
        $featured = Article::query()
            ->published()
            ->where('is_featured', true)
            ->with('category:id,name,slug')
            ->latest('published_at')
            ->first();

        $articles = Article::query()
            ->published()
            ->with('category:id,name,slug')
            ->when($request->filled('category'), fn ($q) => $q->whereHas('category', fn ($sub) => $sub->where('slug', $request->string('category'))))
            ->when($featured, fn ($q) => $q->where('id', '!=', $featured->id))
            ->latest('published_at')
            ->paginate(9)
            ->withQueryString();

        return Inertia::render('public/news/Index', [
            'featuredArticle' => $featured,
            'articles' => $articles,
            'categories' => NewsCategory::orderBy('name')->get(['id', 'name', 'slug']),
            'filters' => $request->only(['category']),
            'seo' => $this->seo->resolveStatic(__('News'), __('Latest company news and updates.')),
        ]);
    }

    public function show(string $slug): Response
    {
        $article = Article::query()
            ->published()
            ->where('slug', $slug)
            ->with(['category:id,name,slug', 'author:id,name'])
            ->firstOrFail();

        $relatedArticles = Article::query()
            ->published()
            ->where('id', '!=', $article->id)
            ->when($article->news_category_id, fn ($q) => $q->where('news_category_id', $article->news_category_id))
            ->with('category:id,name,slug')
            ->latest('published_at')
            ->limit(3)
            ->get(['id', 'title', 'slug', 'excerpt', 'featured_image', 'published_at', 'news_category_id']);

        $breadcrumb = [
            ['label' => __('News'), 'href' => '/news'],
            ...($article->category ? [['label' => $article->category->name, 'href' => "/news?category={$article->category->slug}"]] : []),
            ['label' => $article->title],
        ];

        $seo = $this->seo->resolve($article, $article->title, $article->excerpt, $article->featured_image, 'article');

        return Inertia::render('public/news/Show', [
            'article' => $article,
            'relatedArticles' => $relatedArticles,
            'seo' => $seo,
            'breadcrumb' => $breadcrumb,
            'schema' => [
                $this->structuredData->breadcrumbList($breadcrumb),
                $this->structuredData->article($article, $seo['canonical_url'] ?? null),
            ],
            'preview' => false,
        ]);
    }
}
