<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use App\Services\SeoService;
use Inertia\Inertia;
use Inertia\Response;

class FacilityController extends Controller
{
    public function __construct(
        private readonly SeoService $seo,
    ) {}

    public function index(): Response
    {
        $facilities = Facility::query()
            ->published()
            ->with([
                'category:id,name',
                'machines' => fn ($q) => $q->active()->orderBy('sort_order'),
            ])
            ->orderBy('sort_order')
            ->get(['id', 'facility_category_id', 'name', 'slug', 'location', 'description', 'image']);

        return Inertia::render('public/facilities/Index', [
            'facilities' => $facilities,
            'seo' => $this->seo->resolveStatic('Facilities', 'Our production facilities and manufacturing sites.'),
        ]);
    }
}
