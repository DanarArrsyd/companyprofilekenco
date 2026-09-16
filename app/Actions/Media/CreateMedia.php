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
        $dimensions = $this->uploader->dimensionsOf($file);

        $media = Media::create([
            'disk' => 'public',
            'path' => $path,
            'filename' => basename($path),
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'width' => $dimensions['width'] ?? null,
            'height' => $dimensions['height'] ?? null,
            'alt_text' => $altText,
            'uploaded_by' => Auth::id(),
        ]);

        $this->activityLog->record('media.uploaded', $media, ['original_name' => $media->original_name]);

        return $media;
    }
}
