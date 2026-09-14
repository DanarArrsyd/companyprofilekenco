<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
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

        return $this->render($page);
    }

    /**
     * Company section pages: /company, /company/vision-mission, etc.
     * The slug is stored as the full path ("company", "company/vision-mission").
     */
    public function company(?string $path = null): Response
    {
        $slug = $path ? "company/{$path}" : 'company';

        return $this->show($slug);
    }

    private function render(Page $page): Response
    {
        $page->load(['sections' => fn ($query) => $query->active()->orderBy('sort_order')]);

        return Inertia::render('public/Page', [
            'page' => $page,
            'seo' => $this->seo->resolve($page, $page->title),
            'preview' => false,
        ]);
    }
}
