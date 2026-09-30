<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

/**
 * Responsive copies of public-disk images (performance audit 2026-09-30).
 *
 * A variant is a WebP no wider than one of WIDTHS, stored on the public disk
 * at "_variants/w{width}/{source path}.webp" — the same address the browser
 * asks for under /storage, so after the first request Apache and the CDN
 * serve it as a plain static file and PHP never sees it again. The first
 * miss falls through to ImageVariantController, which builds it here.
 * Nothing is recorded in the database: any stored image, old uploads
 * included, gets variants the first time a page asks for them.
 */
class ImageVariantService
{
    /** Keep in sync with VARIANT_WIDTHS in resources/js/lib/responsive-image.ts. */
    public const WIDTHS = [480, 960, 1440, 2000];

    public const DIRECTORY = '_variants';

    private const SOURCE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

    private const QUALITY = 80;

    public function variantPath(string $source, int $width): string
    {
        return self::DIRECTORY."/w{$width}/{$source}.webp";
    }

    /**
     * Whether `$source` is a stored image a variant can be built from:
     * a relative path with a known image extension, never a variant itself,
     * never climbing out of the disk.
     */
    public function isEligible(string $source): bool
    {
        $extension = strtolower(pathinfo($source, PATHINFO_EXTENSION));

        return $source !== ''
            && in_array($extension, self::SOURCE_EXTENSIONS, true)
            && ! str_starts_with($source, self::DIRECTORY.'/')
            && ! str_starts_with($source, '/')
            && ! preg_match('#(^|/)\.\.?(/|$)#', $source)
            && ! str_contains($source, '\\');
    }

    /**
     * Build (or reuse) the variant and return its public-disk path, or null
     * when the width is not offered, the source is missing or unreadable,
     * or GD cannot write WebP.
     */
    public function ensure(string $source, int $width): ?string
    {
        if (! in_array($width, self::WIDTHS, true) || ! $this->isEligible($source)) {
            return null;
        }

        $disk = Storage::disk('public');
        $target = $this->variantPath($source, $width);

        if ($disk->exists($target)) {
            return $target;
        }

        if (! $disk->exists($source) || ! extension_loaded('gd') || ! function_exists('imagewebp')) {
            return null;
        }

        $image = $this->read($disk->path($source));

        if (! $image) {
            return null;
        }

        try {
            $image = $this->scaleDown($image, $width);
            $disk->makeDirectory(dirname($target));

            // Write beside the target, then move, so a concurrent request never reads half a file.
            $temporary = $disk->path($target).'.'.bin2hex(random_bytes(4)).'.tmp';

            if (! imagewebp($image, $temporary, self::QUALITY)) {
                @unlink($temporary);

                return null;
            }

            rename($temporary, $disk->path($target));
        } finally {
            imagedestroy($image);
        }

        return $target;
    }

    /**
     * The `srcset` the frontend's responsiveImage() builds for `$path`, so a
     * <link rel="preload" imagesrcset> in the HTML head fetches exactly the
     * file the <img> will pick. Null when `$path` is not a stored raster image.
     */
    public function srcset(?string $path): ?string
    {
        $source = $path !== null && str_starts_with($path, '/storage/') ? substr($path, strlen('/storage/')) : $path;

        if ($source === null || ! $this->isEligible($source)) {
            return null;
        }

        return implode(', ', array_map(
            fn (int $width) => '/storage/'.$this->variantPath($source, $width)." {$width}w",
            self::WIDTHS,
        ));
    }

    /** Delete every variant of `$source` (the file was replaced or removed). */
    public function forget(?string $source): void
    {
        if (! $source || ! $this->isEligible($source)) {
            return;
        }

        $disk = Storage::disk('public');

        foreach (self::WIDTHS as $width) {
            $disk->delete($this->variantPath($source, $width));
        }
    }

    private function read(string $fullPath): ?\GdImage
    {
        try {
            $image = match (strtolower(pathinfo($fullPath, PATHINFO_EXTENSION))) {
                'jpg', 'jpeg' => @imagecreatefromjpeg($fullPath),
                'png' => @imagecreatefrompng($fullPath),
                'webp' => @imagecreatefromwebp($fullPath),
                default => false,
            };
        } catch (\Throwable) {
            return null;
        }

        if (! $image instanceof \GdImage) {
            return null;
        }

        imagepalettetotruecolor($image);
        imagealphablending($image, false);
        imagesavealpha($image, true);

        return $image;
    }

    /** Never upscales: a source narrower than `$width` keeps its own size. */
    private function scaleDown(\GdImage $image, int $width): \GdImage
    {
        $sourceWidth = imagesx($image);
        $sourceHeight = imagesy($image);

        if ($sourceWidth <= $width) {
            return $image;
        }

        $height = max(1, (int) round($sourceHeight * $width / $sourceWidth));
        $resized = imagecreatetruecolor($width, $height);
        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        imagefill($resized, 0, 0, imagecolorallocatealpha($resized, 0, 0, 0, 127));
        imagecopyresampled($resized, $image, 0, 0, 0, 0, $width, $height, $sourceWidth, $sourceHeight);
        imagedestroy($image);

        return $resized;
    }
}
