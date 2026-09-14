<?php

namespace App\Actions\Page;

use App\Models\Page;
use App\Services\ActivityLogService;

class DeletePage
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(Page $page): void
    {
        $this->activityLog->record('page.deleted', $page, ['title' => $page->title]);

        $page->delete();
    }
}
