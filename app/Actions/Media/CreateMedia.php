<?php

namespace App\Actions\Media;

use App\Models\Media;
use App\Services\ActivityLogService;
use App\Services\MediaUploadService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;

class CreateMedia
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
        private readonly MediaUploadService $uploader,
    ) {}

    public function handle(UploadedFile $file, ?string $altText = null): Media
    {
        $path = $this->uploader->storePublicFile($file, 'library');
        $meta = $this->uploader->metadataOf($path);

        $media = Media::create([
            'disk' => 'public',
            'path' => $path,
            'filename' => basename($path),
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $meta['mime_type'] ?? $file->getMimeType(),
            'size' => $meta['size'] ?? $file->getSize(),
            'width' => $meta['width'] ?? null,
            'height' => $meta['height'] ?? null,
            'alt_text' => $altText,
            'uploaded_by' => Auth::id(),
        ]);

        $this->activityLog->record('media.uploaded', $media, ['original_name' => $media->original_name]);

        return $media;
    }
}
