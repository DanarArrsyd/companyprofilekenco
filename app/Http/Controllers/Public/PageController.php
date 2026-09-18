<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Services\SeoService;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    /**
     * Slugs CLAUDE.md requires to exist as public routes regardless of
     * whether their CMS Page record has been created yet — these render
     * their static header shell with an empty state instead of a 404, the
     * same way Facilities/Industries always render their shell even with
     * zero published items.
     */
    private const REQUIRED_SLUGS = [
        'company' => 'Company',
        'company/vision-mission' => 'Vision & Mission',
    ];

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

        return $this->render($slug, $page);
    }

    /**
     * Company section pages: /company, /company/vision-mission, etc.
     * The slug is stored as the full path ("company", "company/vision-mission").
     */
    public function company(?string $path = null): Response
    {
        $slug = $path ? "company/{$path}" : 'company';

        if (! array_key_exists($slug, self::REQUIRED_SLUGS)) {
            return $this->show($slug);
        }

        $page = Page::query()
            ->standard()
            ->published()
            ->where('slug', $slug)
            ->first();

        return $this->render($slug, $page);
    }

    private function render(string $slug, ?Page $page): Response
    {
        $page?->load(['sections' => fn ($query) => $query->active()->orderBy('sort_order')]);

        return Inertia::render('public/Page', [
            'slug' => $slug,
            'page' => $page,
            'seo' => $page
                ? $this->seo->resolve($page, $page->title)
                : $this->seo->resolveStatic(self::REQUIRED_SLUGS[$slug] ?? $slug),
            'preview' => false,
        ]);
    }
}
