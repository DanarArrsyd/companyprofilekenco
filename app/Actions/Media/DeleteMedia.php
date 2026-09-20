<?php

namespace App\Actions\Media;

use App\Models\Media;
use App\Services\ActivityLogService;
use App\Services\MediaUploadService;

class DeleteMedia
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
        private readonly MediaUploadService $uploader,
    ) {}

    public function handle(Media $media): void
    {
        $this->uploader->deletePublic($media->path);

        $this->activityLog->record('media.deleted', $media, ['original_name' => $media->original_name]);

        $media->delete();
    }
}
