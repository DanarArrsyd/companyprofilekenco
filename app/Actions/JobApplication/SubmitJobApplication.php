<?php

namespace App\Actions\JobApplication;

use App\Models\JobApplication;
use App\Models\JobVacancy;
use App\Services\MediaUploadService;

class SubmitJobApplication
{
    public function __construct(
        private readonly MediaUploadService $media,
    ) {}

    public function handle(JobVacancy $vacancy, array $data): JobApplication
    {
        $cvPath = $this->media->storePrivateDocument($data['cv'], 'applications');

        return JobApplication::create([
            'job_vacancy_id' => $vacancy->id,
            'applicant_name' => $data['name'],
            'applicant_email' => $data['email'],
            'applicant_phone' => $data['phone'] ?? null,
            'applicant_address' => $data['address'] ?? null,
            'cover_letter' => $data['cover_letter'] ?? null,
            'cv_path' => $cvPath,
        ]);
    }
}
