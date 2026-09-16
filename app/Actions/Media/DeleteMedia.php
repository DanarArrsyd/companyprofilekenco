<?php

namespace App\Actions\Media;

use App\Models\Article;
use App\Models\Capability;
use App\Models\Certification;
use App\Models\Media;
use App\Models\Product;
use App\Services\ActivityLogService;
use App\Services\MediaUploadService;

class DeleteMedia
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
        private readonly MediaUploadService $uploader,
    ) {}

    /**
     * Refuse to delete a media file that's still referenced by content —
     * either through the media_id foreign key (Certification) or a raw
     * stored path (Product/Article/Capability featured images picked from
     * the library).
     */
    public function isInUse(Media $media): bool
    {
        return Certification::where('media_id', $media->id)->exists()
            || Product::where('featured_image', $media->path)->exists()
            || Article::where('featured_image', $media->path)->exists()
            || Capability::where('featured_image', $media->path)->exists();
    }

    public function handle(Media $media): void
    {
        $this->uploader->deletePublic($media->path);

        $this->activityLog->record('media.deleted', $media, ['original_name' => $media->original_name]);

        $media->delete();
    }
}
