<?php

namespace App\Actions\Media;

use App\Models\Media;
use App\Services\ActivityLogService;
use App\Services\MediaUploadService;
use Illuminate\Http\UploadedFile;

/**
 * Overwrites the file in place at the Media's existing path, so any stored
 * reference to that path (e.g. a certification's media_id) keeps resolving
 * correctly without needing to be updated everywhere.
 */
class ReplaceMediaFile
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
        private readonly MediaUploadService $uploader,
    ) {}

    public function handle(Media $media, UploadedFile $file): Media
    {
        $this->uploader->replacePublicFile($media->path, $file);
        $meta = $this->uploader->metadataOf($media->path);

        $media->update([
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $meta['mime_type'] ?? $file->getMimeType(),
            'size' => $meta['size'] ?? $file->getSize(),
            'width' => $meta['width'] ?? null,
            'height' => $meta['height'] ?? null,
        ]);

        $this->activityLog->record('media.replaced', $media, ['original_name' => $media->original_name]);

        return $media->fresh();
    }
}
