<?php

namespace App\Actions\JobVacancy;

use App\Enums\ContentStatus;
use App\Models\JobVacancy;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\Auth;

class PublishJobVacancy
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(JobVacancy $vacancy): JobVacancy
    {
        $vacancy->update([
            'status' => ContentStatus::Published,
            'published_at' => $vacancy->published_at ?? now(),
            'updated_by' => Auth::id(),
        ]);

        $this->activityLog->record('job_vacancy.published', $vacancy, ['title' => $vacancy->title]);

        return $vacancy->fresh();
    }
}
