<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Minimal reusable upload foundation — safe storage for images and
 * documents. MIME/size rules live in each Form Request (the standard
 * Laravel validation layer); this service only handles safe naming,
 * storage, and best-effort image optimization.
 */
class MediaUploadService
{
    /**
     * Store a public image (jpg/jpeg/png/webp) and return its relative path.
     */
    public function storePublicImage(UploadedFile $file, string $directory): string
    {
        $path = $file->storeAs($directory, $this->safeFilename($file), 'public');

        $this->optimizeToWebp($path);

        return $path;
    }

    /**
     * Store a private document (e.g. a certification PDF) and return its
     * relative path on the private local disk.
     */
    public function storePrivateDocument(UploadedFile $file, string $directory): string
    {
        return $file->storeAs($directory, $this->safeFilename($file), 'local');
    }

    /**
     * Store any allowed public file (image or document) for the Media
     * Library, applying WebP optimization only when it's an image.
     */
    public function storePublicFile(UploadedFile $file, string $directory): string
    {
        $path = $file->storeAs($directory, $this->safeFilename($file), 'public');

        if (str_starts_with($file->getMimeType() ?: '', 'image/')) {
            $this->optimizeToWebp($path);
        }

        return $path;
    }

    /**
     * Replace the file at an existing Media Library path in place, so any
     * stored reference to that path keeps resolving to the new content.
     */
    public function replacePublicFile(string $existingPath, UploadedFile $file): void
    {
        Storage::disk('public')->put($existingPath, file_get_contents($file->getRealPath()));

        if (str_starts_with($file->getMimeType() ?: '', 'image/')) {
            $this->optimizeToWebp($existingPath);
        }
    }

    /**
     * Pixel dimensions for an image upload, or null for non-images /
     * unreadable files. Best-effort — never throws.
     */
    public function dimensionsOf(UploadedFile $file): ?array
    {
        if (! str_starts_with($file->getMimeType() ?: '', 'image/')) {
            return null;
        }

        $size = @getimagesize($file->getRealPath());

        return $size ? ['width' => $size[0], 'height' => $size[1]] : null;
    }

    public function deletePublic(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }

    public function deletePrivate(?string $path): void
    {
        if ($path) {
            Storage::disk('local')->delete($path);
        }
    }

    private function safeFilename(UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'bin');

        return Str::uuid()->toString().'.'.$extension;
    }

    /**
     * Best-effort WebP copy alongside the original. Silently skipped when
     * the GD extension or WebP support isn't available in this environment
     * — the original upload remains the source of truth either way.
     */
    private function optimizeToWebp(string $path): void
    {
        if (! extension_loaded('gd') || ! function_exists('imagewebp')) {
            return;
        }

        try {
            $fullPath = Storage::disk('public')->path($path);
            $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

            $image = match ($extension) {
                'jpg', 'jpeg' => @imagecreatefromjpeg($fullPath),
                'png' => @imagecreatefrompng($fullPath),
                default => null,
            };

            if (! $image) {
                return;
            }

            $webpPath = preg_replace('/\.[^.]+$/', '.webp', $fullPath);
            imagewebp($image, $webpPath, 82);
            imagedestroy($image);
        } catch (\Throwable) {
            // Optimization is best-effort; never block the upload on failure.
        }
    }
}
