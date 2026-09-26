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

        // A submitted featured_image_path replaces the image; an empty one
        // removes it. Leaving the key out keeps the current image.
        if (isset($data['featured_image']) && $data['featured_image'] !== null) {
            $featuredImage = $this->media->storePublicImage($data['featured_image'], 'capabilities');
        } elseif (array_key_exists('featured_image_path', $data)) {
            $featuredImage = $data['featured_image_path'];
        }

        if ($featuredImage !== $capability->featured_image) {
            $this->mediaLifecycle->deleteIfUnmanaged($capability->featured_image);
        }

        return DB::transaction(function () use ($capability, $data, $featuredImage) {
            $capability->update([
                'translations' => $data['translations'] ?? [],
                'slug' => $data['slug'] ?? $capability->slug,
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
