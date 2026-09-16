<?php

namespace App\Actions\JobVacancy;

use App\Models\JobVacancy;
use App\Services\ActivityLogService;
use App\Services\MediaUploadService;
use App\Services\SeoService;
use App\Support\SlugGenerator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CreateJobVacancy
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
        private readonly MediaUploadService $media,
        private readonly SeoService $seo,
    ) {}

    public function handle(array $data): JobVacancy
    {
        $slug = trim($data['slug'] ?? '') !== ''
            ? $data['slug']
            : SlugGenerator::unique('job_vacancies', $data['title']);

        return DB::transaction(function () use ($data, $slug) {
            $vacancy = JobVacancy::create([
                'title' => $data['title'],
                'slug' => $slug,
                'department' => $data['department'] ?? null,
                'location' => $data['location'] ?? null,
                'employment_type' => $data['employment_type'] ?? null,
                'description' => $data['description'] ?? null,
                'requirements' => $data['requirements'] ?? null,
                'status' => $data['status'],
                'published_at' => $data['published_at'] ?? null,
                'closes_at' => $data['closes_at'] ?? null,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ]);

            $this->seo->saveMetadata($vacancy, $data['seo'] ?? [], $this->media, 'seo/careers');

            $this->activityLog->record('job_vacancy.created', $vacancy, ['title' => $vacancy->title]);

            return $vacancy;
        });
    }
}
