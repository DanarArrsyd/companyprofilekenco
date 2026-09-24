<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\QualityContent;
use App\Services\SeoService;
use Inertia\Inertia;
use Inertia\Response;

class QualityController extends Controller
{
    public function __construct(
        private readonly SeoService $seo,
    ) {}

    public function index(): Response
    {
        $items = QualityContent::query()
            ->published()
            ->orderBy('sort_order')
            ->get(['id', 'title', 'slug', 'summary', 'content', 'image']);

        return Inertia::render('public/quality/Index', [
            'items' => $items,
            'seo' => $this->seo->resolveStatic(__('Quality'), __('Our commitment to manufacturing quality.')),
        ]);
    }
}
