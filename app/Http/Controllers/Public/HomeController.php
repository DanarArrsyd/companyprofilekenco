<?php

namespace App\Http\Controllers\Public;

use App\Enums\PageType;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Capability;
use App\Models\Certification;
use App\Models\Facility;
use App\Models\Industry;
use App\Models\JobVacancy;
use App\Models\Milestone;
use App\Models\Page;
use App\Models\Product;
use App\Services\SeoService;
use App\Services\StructuredDataService;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        private readonly SeoService $seo,
        private readonly StructuredDataService $structuredData,
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
            'seo' => $this->seo->homepage($page),
            'schema' => [
                $this->structuredData->organization(),
                $this->structuredData->website(),
            ],
            'latestArticles' => Article::query()
                ->published()
                ->with('category:id,name')
                ->latest('published_at')
                ->limit(3)
                ->get(['id', 'title', 'slug', 'excerpt', 'featured_image', 'published_at', 'news_category_id']),
            'certifications' => Certification::query()
                ->published()
                ->with('media:id,path')
                ->orderBy('sort_order')
                ->limit(6)
                ->get(['id', 'name', 'issuer', 'expires_at', 'media_id', 'sort_order'])
                ->map(fn (Certification $cert) => [
                    'id' => $cert->id,
                    'name' => $cert->name,
                    'issuer' => $cert->issuer,
                    'expires_at' => $cert->expires_at,
                    'image' => $cert->media?->path,
                ]),
            'industries' => Industry::query()
                ->published()
                ->orderBy('sort_order')
                ->limit(6)
                ->get(['id', 'name', 'slug', 'image']),
            'milestones' => Milestone::query()
                ->orderBy('year')
                ->orderBy('order')
                ->get(['id', 'year', 'title', 'description', 'image']),
            'openJobCount' => JobVacancy::query()
                ->published()
                ->where(fn ($q) => $q->whereNull('closes_at')->orWhere('closes_at', '>', now()))
                ->count(),
        ]);
    }

    /**
     * Resolve referenced IDs (capabilities/products/facilities) into their
     * public display data with one query per section — never per item, so
     * this stays free of N+1 regardless of how many sections are active.
     */
    private function hydrateSections(Collection $sections): Collection
    {
        return $sections->map(function ($section) {
            $content = $section->content ?? [];
            $type = $section->section_type->value;

            if ($type === 'capabilities' && ! empty($content['capability_ids'])) {
                $content['items'] = Capability::query()
                    ->published()
                    ->whereIn('id', $content['capability_ids'])
                    ->get(['id', 'name', 'slug', 'summary', 'featured_image']);
            }

            if ($type === 'products' && ! empty($content['product_ids'])) {
                $content['items'] = Product::query()
                    ->published()
                    ->whereIn('id', $content['product_ids'])
                    ->get(['id', 'name', 'slug', 'short_description', 'featured_image']);
            }

            if ($type === 'facilities' && ! empty($content['facility_ids'])) {
                $content['items'] = Facility::query()
                    ->published()
                    ->whereIn('id', $content['facility_ids'])
                    ->with(['machines' => fn ($q) => $q->active()->orderBy('sort_order')->limit(4)])
                    ->orderBy('sort_order')
                    ->limit(1)
                    ->get(['id', 'name', 'slug', 'location', 'image']);
            }

            $section->setAttribute('content', $content);

            return $section;
        });
    }
}
