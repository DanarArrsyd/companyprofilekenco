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
        $filters = $request->validate([
            'category' => ['nullable', 'string', 'max:100'],
            'year' => ['nullable', 'integer', 'between:2000,2100'],
            'sort' => ['nullable', 'in:newest,oldest'],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $category = $filters['category'] ?? null;
        $year = $filters['year'] ?? null;
        $sort = $filters['sort'] ?? 'newest';
        $search = trim($filters['search'] ?? '');

        $categoryArticles = Article::query()
            ->published()
            ->when($category, fn ($q) => $q->whereHas('category', fn ($sub) => $sub->where('slug', $category)));

        $featured = (clone $categoryArticles)
            ->where('is_featured', true)
            ->with('category:id,name,slug')
            ->latest('published_at')
            ->first()
            ?? (clone $categoryArticles)
                ->with('category:id,name,slug')
                ->latest('published_at')
                ->first();

        $articles = (clone $categoryArticles)
            ->with('category:id,name,slug')
            ->when($year, fn ($q) => $q->whereYear('published_at', $year))
            ->when($search !== '', fn ($q) => $q->where(fn ($sub) => $sub
                ->where('title', 'like', "%{$search}%")
                ->orWhere('excerpt', 'like', "%{$search}%")))
            ->orderBy('published_at', $sort === 'oldest' ? 'asc' : 'desc')
            ->orderBy('id', $sort === 'oldest' ? 'asc' : 'desc')
            ->paginate(9)
            ->withQueryString();

        $years = (clone $categoryArticles)
            ->whereNotNull('published_at')
            ->selectRaw('DISTINCT SUBSTR(published_at, 1, 4) as year')
            ->orderByDesc('year')
            ->pluck('year');

        return Inertia::render('public/news/Index', [
            'featuredArticle' => $featured,
            'articles' => $articles,
            'categories' => NewsCategory::orderBy('name')->get(['id', 'name', 'slug']),
            'years' => $years,
            'filters' => [
                'category' => $category,
                'year' => $year,
                'sort' => $sort,
                'search' => $search,
            ],
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
            ['label' => __('Home'), 'href' => '/'],
            ['label' => __('News'), 'href' => $article->category ? "/news?category={$article->category->slug}" : '/news'],
            ['label' => $article->title],
        ];

        $seo = $this->seo->resolve($article, $article->title, $article->excerpt, $article->featured_image, 'article');

        return Inertia::render('public/news/Show', [
            'article' => $article,
            'readingMinutes' => $article->readingMinutes(),
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
