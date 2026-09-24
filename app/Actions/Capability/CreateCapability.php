<?php

namespace App\Actions\Capability;

use App\Models\Capability;
use App\Services\ActivityLogService;
use App\Services\MediaUploadService;
use App\Services\SeoService;
use App\Support\SlugGenerator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CreateCapability
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
        private readonly MediaUploadService $media,
        private readonly SeoService $seo,
    ) {}

    public function handle(array $data): Capability
    {
        $slug = trim($data['slug'] ?? '') !== ''
            ? $data['slug']
            : SlugGenerator::unique('capabilities', $data['name']);

        $featuredImage = match (true) {
            isset($data['featured_image']) && $data['featured_image'] !== null => $this->media->storePublicImage($data['featured_image'], 'capabilities'),
            ! empty($data['featured_image_path']) => $data['featured_image_path'],
            default => null,
        };

        return DB::transaction(function () use ($data, $slug, $featuredImage) {
            $capability = Capability::create([
                'translations' => $data['translations'] ?? [],
                'name' => $data['name'],
                'slug' => $slug,
                'summary' => $data['summary'] ?? null,
                'description' => $data['description'] ?? null,
                'featured_image' => $featuredImage,
                'icon' => $data['icon'] ?? null,
                'is_featured' => $data['is_featured'] ?? false,
                'sort_order' => $data['sort_order'] ?? 0,
                'status' => $data['status'],
                'published_at' => $data['published_at'] ?? null,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ]);

            $this->seo->saveMetadata($capability, $data['seo'] ?? [], $this->media, 'seo/capabilities');

            $this->activityLog->record('capability.created', $capability, ['name' => $capability->name]);

            return $capability;
        });
    }
}
