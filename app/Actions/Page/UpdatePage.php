<?php

namespace App\Actions\Page;

use App\Models\Page;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UpdatePage
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(Page $page, array $data): Page
    {
        return DB::transaction(function () use ($page, $data) {
            $page->update([
                'title' => $data['title'],
                // Slug is intentionally left untouched here — editing a page
                // must never silently change its public URL.
                'status' => $data['status'],
                'published_at' => $data['published_at'] ?? null,
                'updated_by' => Auth::id(),
            ]);

            $page->seoMetadata()->updateOrCreate([], $data['seo'] ?? []);

            $this->activityLog->record('page.updated', $page, ['title' => $page->title]);

            return $page->fresh();
        });
    }
}
