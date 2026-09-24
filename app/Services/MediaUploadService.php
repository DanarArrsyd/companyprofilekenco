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
     * Longest side, in pixels, an optimized image is constrained to.
     * Public pages never display an image larger than this, and raw
     * camera/phone uploads routinely arrive several times over it.
     */
    private const MAX_DIMENSION = 2000;

    /**
     * Store a public image (jpg/jpeg/png/webp) and return its relative path.
     * The path may end in .webp even if the upload didn't — see optimizeNewUpload().
     */
    public function storePublicImage(UploadedFile $file, string $directory): string
    {
        $path = $file->storeAs($directory, $this->safeFilename($file), 'public');

        return $this->optimizeNewUpload($path) ?? $path;
    }

    /**
     * Store a public image exactly as uploaded — no resize or WebP re-encode.
     * For small assets whose format matters, like a favicon (.ico has no
     * WebP equivalent and browser tabs need the original transparency).
     */
    public function storePublicImageAsIs(UploadedFile $file, string $directory): string
    {
        return $file->storeAs($directory, $this->safeFilename($file), 'public');
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
            return $this->optimizeNewUpload($path) ?? $path;
        }

        return $path;
    }

    /**
     * Replace the file at an existing Media Library path in place, so any
     * stored reference to that path keeps resolving to the new content.
     * Unlike a new upload, the path (and its extension) can't change here.
     */
    public function replacePublicFile(string $existingPath, UploadedFile $file): void
    {
        Storage::disk('public')->put($existingPath, file_get_contents($file->getRealPath()));

        if (str_starts_with($file->getMimeType() ?: '', 'image/')) {
            $this->resizeInPlace($existingPath);
        }
    }

    /**
     * Actual size/dimensions/mime of a stored public file, read from disk
     * so it reflects optimization (resize, WebP conversion) rather than
     * whatever the original upload looked like before it was processed.
     */
    public function metadataOf(string $path): array
    {
        $fullPath = Storage::disk('public')->path($path);
        $imageInfo = @getimagesize($fullPath);

        return [
            'size' => @filesize($fullPath) ?: null,
            'width' => $imageInfo[0] ?? null,
            'height' => $imageInfo[1] ?? null,
            'mime_type' => $imageInfo['mime'] ?? null,
        ];
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

    /**
     * Stored extensions come from the sniffed content, never the client's
     * file name: validation checks the bytes, so trusting the name would let
     * a valid PDF/PNG named "x.html" land on the public disk as same-origin
     * HTML. Anything outside the upload allowlist is stored inert as .bin.
     */
    private const STORABLE_EXTENSIONS = ['jpg', 'png', 'webp', 'pdf', 'ico', 'doc', 'docx'];

    private function safeFilename(UploadedFile $file): string
    {
        $extension = strtolower((string) $file->guessExtension());
        $extension = $extension === 'jpeg' ? 'jpg' : $extension;

        if (! in_array($extension, self::STORABLE_EXTENSIONS, true)) {
            $extension = 'bin';
        }

        return Str::uuid()->toString().'.'.$extension;
    }

    /**
     * Convert a freshly stored image to a size-constrained WebP file and
     * return its (renamed) path, deleting the original. Safe to rename
     * here because nothing references this path yet. Returns null (keep
     * the original path/format untouched) when GD or WebP isn't available.
     */
    private function optimizeNewUpload(string $path): ?string
    {
        $image = $this->readImage($path);

        if (! $image) {
            return null;
        }

        $image = $this->constrainDimensions($image);

        $disk = Storage::disk('public');
        $webpPath = preg_replace('/\.[^.]+$/', '.webp', $path);

        try {
            imagewebp($image, $disk->path($webpPath), 82);
        } finally {
            imagedestroy($image);
        }

        if ($webpPath !== $path) {
            $disk->delete($path);
        }

        return $webpPath;
    }

    /**
     * Re-encode an image at its existing path/format, downscaling it if
     * it's larger than MAX_DIMENSION. Used for in-place replacement, where
     * the path (and therefore the format) must stay exactly as it was.
     */
    private function resizeInPlace(string $path): void
    {
        $image = $this->readImage($path);

        if (! $image) {
            return;
        }

        $image = $this->constrainDimensions($image);

        $disk = Storage::disk('public');
        $fullPath = $disk->path($path);
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        try {
            match ($extension) {
                'jpg', 'jpeg' => imagejpeg($image, $fullPath, 85),
                'png' => imagepng($image, $fullPath),
                'webp' => imagewebp($image, $fullPath, 82),
                default => null,
            };
        } finally {
            imagedestroy($image);
        }
    }

    /**
     * Best-effort image read. Returns null (caller keeps the file
     * untouched) when GD/WebP support is missing or the file isn't a
     * format we know how to decode — optimization must never block or
     * corrupt an upload.
     */
    private function readImage(string $path): ?\GdImage
    {
        if (! extension_loaded('gd') || ! function_exists('imagewebp')) {
            return null;
        }

        try {
            $fullPath = Storage::disk('public')->path($path);
            $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

            $image = match ($extension) {
                'jpg', 'jpeg' => @imagecreatefromjpeg($fullPath),
                'png' => @imagecreatefrompng($fullPath),
                'webp' => @imagecreatefromwebp($fullPath),
                default => null,
            };

            if (! $image instanceof \GdImage) {
                return null;
            }

            imagepalettetotruecolor($image);
            imagealphablending($image, true);
            imagesavealpha($image, true);

            return $image;
        } catch (\Throwable) {
            return null;
        }
    }

    private function constrainDimensions(\GdImage $image): \GdImage
    {
        $width = imagesx($image);
        $height = imagesy($image);

        if ($width <= self::MAX_DIMENSION && $height <= self::MAX_DIMENSION) {
            return $image;
        }

        $scale = self::MAX_DIMENSION / max($width, $height);
        $newWidth = max(1, (int) round($width * $scale));
        $newHeight = max(1, (int) round($height * $scale));

        $resized = imagecreatetruecolor($newWidth, $newHeight);
        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
        imagedestroy($image);

        return $resized;
    }
}
