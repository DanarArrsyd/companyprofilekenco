<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Capability;
use App\Services\SeoService;
use App\Services\StructuredDataService;
use Inertia\Inertia;
use Inertia\Response;

class CapabilityController extends Controller
{
    public function __construct(
        private readonly SeoService $seo,
        private readonly StructuredDataService $structuredData,
    ) {}

    public function index(): Response
    {
        $capabilities = Capability::query()
            ->published()
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug', 'summary', 'featured_image', 'icon']);

        return Inertia::render('public/capabilities/Index', [
            'capabilities' => $capabilities,
            'seo' => $this->seo->resolveStatic('Capabilities', 'Explore our manufacturing capabilities.'),
        ]);
    }

    public function show(string $slug): Response
    {
        $capability = Capability::query()
            ->published()
            ->with(['steps' => fn ($q) => $q->orderBy('sort_order'), 'machines:id,name,brand,model,capacity,quantity'])
            ->where('slug', $slug)
            ->firstOrFail();

        $breadcrumb = [
            ['label' => 'Capabilities', 'href' => '/capabilities'],
            ['label' => $capability->name],
        ];

        $seo = $this->seo->resolve($capability, $capability->name, $capability->summary, $capability->featured_image);

        return Inertia::render('public/capabilities/Show', [
            'capability' => $capability,
            'seo' => $seo,
            'breadcrumb' => $breadcrumb,
            'schema' => [
                $this->structuredData->breadcrumbList($breadcrumb),
                $this->structuredData->service($capability),
            ],
            'preview' => false,
        ]);
    }
}
