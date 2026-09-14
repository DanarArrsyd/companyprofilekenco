<?php

namespace App\Actions\PageSection;

use App\Models\Page;
use App\Models\PageSection;
use App\Services\ActivityLogService;

class SavePageSection
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(Page $page, array $data, ?PageSection $section = null): PageSection
    {
        if ($section) {
            $section->update($data);
        } else {
            $data['sort_order'] = $data['sort_order'] ?? (($page->sections()->max('sort_order') ?? -1) + 1);
            $section = $page->sections()->create($data);
        }

        $this->activityLog->record('page.updated', $page, ['section' => $section->section_type->value]);

        return $section;
    }
}
