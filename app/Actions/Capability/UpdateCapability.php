<?php

namespace App\Actions\Capability;

use App\Models\Capability;
use App\Services\ActivityLogService;
use App\Services\MediaLifecycleService;
use App\Services\MediaUploadService;
use App\Services\SeoService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UpdateCapability
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
        private readonly MediaUploadService $media,
        private readonly MediaLifecycleService $mediaLifecycle,
        private readonly SeoService $seo,
    ) {}

    public function handle(Capability $capability, array $data): Capability
    {
        $featuredImage = $capability->featured_image;

        if (isset($data['featured_image']) && $data['featured_image'] !== null) {
            $this->mediaLifecycle->deleteIfUnmanaged($capability->featured_image);
            $featuredImage = $this->media->storePublicImage($data['featured_image'], 'capabilities');
        } elseif (! empty($data['featured_image_path'])) {
            if ($data['featured_image_path'] !== $capability->featured_image) {
                $this->mediaLifecycle->deleteIfUnmanaged($capability->featured_image);
            }
            $featuredImage = $data['featured_image_path'];
        }

        return DB::transaction(function () use ($capability, $data, $featuredImage) {
            $capability->update([
                'translations' => $data['translations'] ?? [],
                'name' => $data['name'],
                'summary' => $data['summary'] ?? null,
                'description' => $data['description'] ?? null,
                'featured_image' => $featuredImage,
                'icon' => $data['icon'] ?? null,
                'is_featured' => $data['is_featured'] ?? false,
                'sort_order' => $data['sort_order'] ?? 0,
                'status' => $data['status'],
                'published_at' => $data['published_at'] ?? null,
                'updated_by' => Auth::id(),
            ]);

            $this->seo->saveMetadata($capability, $data['seo'] ?? [], $this->media, 'seo/capabilities');

            $this->activityLog->record('capability.updated', $capability, ['name' => $capability->name]);

            return $capability->fresh();
        });
    }
}
