<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ActivityLog;
use App\Models\Capability;
use App\Models\ContactInquiry;
use App\Models\Facility;
use App\Models\JobVacancy;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/Dashboard', [
            'stats' => [
                'publishedProducts' => Product::published()->count(),
                'publishedNews' => Article::published()->count(),
                'openJobVacancies' => JobVacancy::published()
                    ->where(fn ($query) => $query->whereNull('closes_at')->orWhere('closes_at', '>', now()))
                    ->count(),
                'newInquiries' => ContactInquiry::where('status', 'new')->count(),
            ],
            'recentContent' => $this->recentContentUpdates(),
            'recentInquiries' => ContactInquiry::query()
                ->latest()
                ->limit(5)
                ->get(['id', 'name', 'subject', 'status', 'created_at']),
            'recentActivity' => ActivityLog::query()
                ->with('user:id,name')
                ->latest('created_at')
                ->limit(5)
                ->get(['id', 'user_id', 'action', 'created_at']),
        ]);
    }

    /**
     * Merge the most recently updated records across the main content
     * modules into a single, sorted feed.
     */
    private function recentContentUpdates(): Collection
    {
        $sources = [
            'Page' => Page::query()->latest('updated_at')->limit(5)->get(['id', 'title', 'status', 'updated_at']),
            'Product' => Product::query()->latest('updated_at')->limit(5)->get(['id', 'name as title', 'status', 'updated_at']),
            'Article' => Article::query()->latest('updated_at')->limit(5)->get(['id', 'title', 'status', 'updated_at']),
            'Capability' => Capability::query()->latest('updated_at')->limit(5)->get(['id', 'name as title', 'status', 'updated_at']),
            'Facility' => Facility::query()->latest('updated_at')->limit(5)->get(['id', 'name as title', 'status', 'updated_at']),
        ];

        return collect($sources)
            ->flatMap(fn ($items, $type) => $items->map(fn ($item) => [
                'type' => $type,
                'title' => $item->title,
                'status' => $item->status,
                'updated_at' => $item->updated_at,
            ]))
            ->sortByDesc('updated_at')
            ->take(5)
            ->values();
    }
}
