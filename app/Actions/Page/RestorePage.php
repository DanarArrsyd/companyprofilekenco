<?php

namespace App\Actions\Page;

use App\Models\Page;
use App\Services\ActivityLogService;

class RestorePage
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(Page $page): Page
    {
        $page->restore();

        $this->activityLog->record('page.restored', $page, ['title' => $page->title]);

        return $page;
    }
}
