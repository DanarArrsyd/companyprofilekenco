<?php

namespace App\Actions\PageSection;

use App\Models\PageSection;
use App\Services\ActivityLogService;

class DeletePageSection
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(PageSection $section): void
    {
        $page = $section->page;

        $section->delete();

        $this->activityLog->record('page.updated', $page, ['removed_section' => $section->section_type->value]);
    }
}
