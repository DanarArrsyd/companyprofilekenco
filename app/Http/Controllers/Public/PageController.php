<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use App\Models\Industry;
use App\Models\Page;
use App\Services\SeoService;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function __construct(
        private readonly SeoService $seo,
    ) {}

    /**
     * Render a published, standard page by its exact slug.
     */
    public function show(string $slug): Response
    {
        $page = Page::query()
            ->standard()
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        $page->load(['sections' => fn ($query) => $query->active()->orderBy('sort_order')]);

        return Inertia::render('public/Page', [
            'slug' => $slug,
            'page' => $page,
            'seo' => $this->seo->resolve($page, $page->title),
            'preview' => false,
        ]);
    }

    /**
     * /company — one long page merging About, Vision & Mission, Facilities,
     * and Industries into #about/#vision-mission/#facilities/#industries
     * sections (the nav's "Company" submenu jumps between them instead of
     * navigating to four separate pages). /company/vision-mission,
     * /facilities, and /industries redirect here — see routes/web.php.
     *
     * Any other slug under company/* (an admin-created custom Page) still
     * falls through to the generic show() renderer.
     */
    public function company(?string $path = null): Response
    {
        if ($path !== null) {
            return $this->show("company/{$path}");
        }

        $aboutPage = Page::query()->standard()->published()->where('slug', 'company')->first();
        $aboutPage?->load(['sections' => fn ($query) => $query->active()->orderBy('sort_order')]);

        $visionPage = Page::query()->standard()->published()->where('slug', 'company/vision-mission')->first();
        $visionPage?->load(['sections' => fn ($query) => $query->active()->orderBy('sort_order')]);

        $facilities = Facility::query()
            ->published()
            ->with([
                'category:id,name',
                'machines' => fn ($q) => $q->active()->orderBy('sort_order'),
            ])
            ->orderBy('sort_order')
            ->get(['id', 'facility_category_id', 'name', 'slug', 'location', 'description', 'image']);

        $industries = Industry::query()
            ->published()
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug', 'description', 'image']);

        return Inertia::render('public/company/Index', [
            'aboutPage' => $aboutPage,
            'visionPage' => $visionPage,
            'facilities' => $facilities,
            'industries' => $industries,
            'seo' => $aboutPage
                ? $this->seo->resolve($aboutPage, $aboutPage->title)
                : $this->seo->resolveStatic('Company'),
        ]);
    }
}
