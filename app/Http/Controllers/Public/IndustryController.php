<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Industry;
use App\Services\SeoService;
use Inertia\Inertia;
use Inertia\Response;

class IndustryController extends Controller
{
    public function __construct(
        private readonly SeoService $seo,
    ) {}

    public function index(): Response
    {
        $industries = Industry::query()
            ->published()
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug', 'description', 'image']);

        return Inertia::render('public/industries/Index', [
            'industries' => $industries,
            'seo' => $this->seo->resolveStatic('Industries', 'Industries we serve.'),
        ]);
    }
}
