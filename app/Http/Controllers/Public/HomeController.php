<?php

namespace App\Http\Controllers\Public;

use App\Enums\PageType;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Capability;
use App\Models\Page;
use App\Models\Product;
use App\Services\SeoService;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        private readonly SeoService $seo,
    ) {}

    public function index(): Response
    {
        $page = Page::query()
            ->where('page_type', PageType::Homepage)
            ->published()
            ->with(['sections' => fn ($query) => $query->active()->orderBy('sort_order')])
            ->first();

        $sections = $page ? $this->hydrateSections($page->sections) : collect();

        return Inertia::render('public/Home', [
            'sections' => $sections,
            'seo' => $page ? $this->seo->resolve($page, 'Home') : [
                'title' => config('app.name'),
                'description' => null,
                'canonical_url' => null,
                'og_title' => config('app.name'),
                'og_description' => null,
                'og_image' => null,
                'robots_index' => true,
                'robots_follow' => true,
            ],
            'latestArticles' => Article::query()
                ->published()
                ->latest('published_at')
                ->limit(3)
                ->get(['id', 'title', 'slug', 'excerpt', 'published_at']),
        ]);
    }

    /**
     * Resolve referenced IDs (capabilities/products) into their public
     * display data. Other section types pass through unchanged.
     */
    private function hydrateSections(Collection $sections): Collection
    {
        return $sections->map(function ($section) {
            $content = $section->content ?? [];

            if ($section->section_type->value === 'capabilities' && ! empty($content['capability_ids'])) {
                $content['items'] = Capability::query()
                    ->published()
                    ->whereIn('id', $content['capability_ids'])
                    ->get(['id', 'name', 'slug', 'summary']);
            }

            if ($section->section_type->value === 'products' && ! empty($content['product_ids'])) {
                $content['items'] = Product::query()
                    ->published()
                    ->whereIn('id', $content['product_ids'])
                    ->get(['id', 'name', 'slug', 'short_description']);
            }

            $section->setAttribute('content', $content);

            return $section;
        });
    }
}
