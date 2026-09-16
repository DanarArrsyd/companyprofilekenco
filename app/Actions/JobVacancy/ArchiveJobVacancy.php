<?php

namespace App\Actions\JobVacancy;

use App\Enums\ContentStatus;
use App\Models\JobVacancy;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\Auth;

class ArchiveJobVacancy
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(JobVacancy $vacancy): JobVacancy
    {
        $vacancy->update([
            'status' => ContentStatus::Archived,
            'updated_by' => Auth::id(),
        ]);

        $this->activityLog->record('job_vacancy.archived', $vacancy, ['title' => $vacancy->title]);

        return $vacancy->fresh();
    }
}
