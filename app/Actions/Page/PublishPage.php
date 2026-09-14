<?php

namespace App\Actions\Page;

use App\Enums\ContentStatus;
use App\Models\Page;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\Auth;

class PublishPage
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(Page $page): Page
    {
        $page->update([
            'status' => ContentStatus::Published,
            'published_at' => $page->published_at ?? now(),
            'updated_by' => Auth::id(),
        ]);

        $this->activityLog->record('page.published', $page, ['title' => $page->title]);

        return $page->fresh();
    }
}
