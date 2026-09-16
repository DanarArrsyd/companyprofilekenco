<?php

namespace App\Actions\JobApplication;

use App\Models\JobApplication;
use App\Services\ActivityLogService;

class UpdateApplicationStatus
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(JobApplication $application, array $data): JobApplication
    {
        $application->update([
            'status' => $data['status'],
            'notes' => $data['notes'] ?? $application->notes,
        ]);

        $this->activityLog->record('job_application.status_updated', $application, [
            'applicant' => $application->applicant_name,
            'status' => $application->status->value,
        ]);

        return $application->fresh();
    }
}
