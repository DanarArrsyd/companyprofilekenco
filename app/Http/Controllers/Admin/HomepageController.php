<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Enums\PageType;
use App\Enums\SectionType;
use App\Http\Controllers\Controller;
use App\Models\Capability;
use App\Models\Page;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class HomepageController extends Controller
{
    public function edit(): Response
    {
        $page = $this->homepage();

        $page->load(['sections' => fn ($query) => $query->orderBy('sort_order')]);

        return Inertia::render('admin/homepage/Edit', [
            'page' => $page,
            'sectionTypes' => array_map(fn ($case) => $case->value, SectionType::forHomepage()),
            'availableCapabilities' => Capability::query()
                ->published()
                ->orderBy('name')
                ->get(['id', 'name']),
            'availableProducts' => Product::query()
                ->published()
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    /**
     * Find the singleton homepage page, provisioning it and its fixed
     * sections on first access so the editor always has something to show.
     */
    private function homepage(): Page
    {
        $page = Page::query()->firstOrCreate(
            ['page_type' => PageType::Homepage],
            [
                'title' => 'Homepage',
                'slug' => 'home',
                'status' => ContentStatus::Published,
                'published_at' => now(),
            ],
        );

        $existingTypes = $page->sections()->pluck('section_type')->map(fn ($type) => $type->value)->all();

        foreach (SectionType::forHomepage() as $index => $type) {
            if (in_array($type->value, $existingTypes, true)) {
                continue;
            }

            $page->sections()->create([
                'section_type' => $type,
                'sort_order' => $index,
                'is_active' => true,
                'content' => [],
            ]);
        }

        return $page;
    }
}
