<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

/**
 * Turns the favicon uploaded in Settings into the files browsers actually
 * use, all on a solid white background so the icon never shows up
 * transparent in one place and white in another:
 *
 *  - PNG copies on the public disk (32 px for the tab, 180 px for
 *    apple-touch-icon), named after the upload so a new icon gets new URLs
 *    past the CDN; Safari and pinned tabs ignore WebP icons and fall back
 *    to whatever they cached before;
 *  - a real favicon.ico (16/32/48 px) in the web root. Browsers (Safari
 *    especially) still request /favicon.ico on their own, and Hostinger's
 *    edge answers that URL from the web root without ever reaching Laravel.
 *
 * An upload GD cannot read (an .ico) is used as it is.
 */
class FaviconFileService
{
    public const TAB_SIZE = 32;

    public const TOUCH_SIZE = 180;

    private const ICO_SIZES = [16, 32, 48];

    private const DIRECTORY = 'favicons';

    /** Public-disk path of the white-background PNG of `$source` at `$size` px. */
    public function iconPath(string $source, int $size): string
    {
        return self::DIRECTORY.'/'.$this->key($source)."-{$size}.png";
    }

    /** Makes the tab and touch PNGs of `$source` if missing; false when GD cannot read it. */
    public function ensure(string $source): bool
    {
        $disk = Storage::disk('public');
        $missing = array_filter(
            [self::TAB_SIZE, self::TOUCH_SIZE],
            fn (int $size) => ! $disk->exists($this->iconPath($source, $size)),
        );

        if ($missing === []) {
            return true;
        }

        $image = $this->read($source);

        if ($image === null) {
            return false;
        }

        foreach ($missing as $size) {
            $disk->put($this->iconPath($source, $size), $this->png($image, $size));
        }

        imagedestroy($image);

        return true;
    }

    public function publish(?string $storagePath, ?string $webRoot = null): void
    {
        $target = rtrim($webRoot ?? public_path(), '/').'/favicon.ico';
        $disk = Storage::disk('public');

        $this->forgetOthers($storagePath);

        if ($storagePath === null || $storagePath === '' || ! $disk->exists($storagePath)) {
            if (is_file($target)) {
                @unlink($target);
            }

            return;
        }

        $image = $this->ensure($storagePath) ? $this->read($storagePath) : null;

        if ($image === null) {
            copy($disk->path($storagePath), $target);

            return;
        }

        file_put_contents($target, $this->ico($image));
        imagedestroy($image);
    }

    /** Removes the generated PNGs of every upload except `$keep`. */
    private function forgetOthers(?string $keep): void
    {
        $disk = Storage::disk('public');
        $prefix = $keep ? $this->key($keep).'-' : null;

        foreach ($disk->files(self::DIRECTORY) as $file) {
            if ($prefix === null || ! str_starts_with(basename($file), $prefix)) {
                $disk->delete($file);
            }
        }
    }

    private function key(string $source): string
    {
        return substr(sha1($source), 0, 16);
    }

    private function read(string $source): ?\GdImage
    {
        $disk = Storage::disk('public');

        if (! extension_loaded('gd') || ! $disk->exists($source)) {
            return null;
        }

        try {
            $image = @imagecreatefromstring($disk->get($source));
        } catch (\Throwable) {
            return null;
        }

        if (! $image instanceof \GdImage) {
            return null;
        }

        imagepalettetotruecolor($image);

        return $image;
    }

    /** The icon fitted (not cropped) into a white square of `$size` px, as PNG bytes. */
    private function png(\GdImage $image, int $size): string
    {
        $canvas = imagecreatetruecolor($size, $size);
        imagefill($canvas, 0, 0, imagecolorallocate($canvas, 255, 255, 255));
        imagealphablending($canvas, true);

        $width = imagesx($image);
        $height = imagesy($image);
        $scale = min($size / $width, $size / $height);
        $fitWidth = max(1, (int) round($width * $scale));
        $fitHeight = max(1, (int) round($height * $scale));

        imagecopyresampled(
            $canvas, $image,
            intdiv($size - $fitWidth, 2), intdiv($size - $fitHeight, 2), 0, 0,
            $fitWidth, $fitHeight, $width, $height,
        );

        ob_start();
        imagepng($canvas, null, 9);
        imagedestroy($canvas);

        return (string) ob_get_clean();
    }

    /** An ICO holding PNG frames, which every current browser reads. */
    private function ico(\GdImage $image): string
    {
        $frames = array_map(fn (int $size) => [$size, $this->png($image, $size)], self::ICO_SIZES);

        $header = pack('vvv', 0, 1, count($frames));
        $directory = '';
        $data = '';
        $offset = 6 + 16 * count($frames);

        foreach ($frames as [$size, $png]) {
            $directory .= pack('CCCCvvVV', $size, $size, 0, 0, 1, 32, strlen($png), $offset);
            $data .= $png;
            $offset += strlen($png);
        }

        return $header.$directory.$data;
    }
}
