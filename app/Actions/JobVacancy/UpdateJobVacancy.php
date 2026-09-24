<?php

namespace App\Actions\JobVacancy;

use App\Models\JobVacancy;
use App\Services\ActivityLogService;
use App\Services\MediaUploadService;
use App\Services\SeoService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UpdateJobVacancy
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
        private readonly MediaUploadService $media,
        private readonly SeoService $seo,
    ) {}

    public function handle(JobVacancy $vacancy, array $data): JobVacancy
    {
        return DB::transaction(function () use ($vacancy, $data) {
            $vacancy->update([
                'translations' => $data['translations'] ?? [],
                'title' => $data['title'],
                'department' => $data['department'] ?? null,
                'location' => $data['location'] ?? null,
                'employment_type' => $data['employment_type'] ?? null,
                'description' => $data['description'] ?? null,
                'requirements' => $data['requirements'] ?? null,
                'status' => $data['status'],
                'published_at' => $data['published_at'] ?? null,
                'closes_at' => $data['closes_at'] ?? null,
                'updated_by' => Auth::id(),
            ]);

            $this->seo->saveMetadata($vacancy, $data['seo'] ?? [], $this->media, 'seo/careers');

            $this->activityLog->record('job_vacancy.updated', $vacancy, ['title' => $vacancy->title]);

            return $vacancy->fresh();
        });
    }
}
