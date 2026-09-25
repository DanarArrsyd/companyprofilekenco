<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

/**
 * Keeps a real favicon.ico in the web root in sync with the favicon uploaded
 * in Settings. Browsers (Safari especially) still request /favicon.ico on
 * their own, and Hostinger's edge answers that URL from the web root
 * without ever reaching Laravel, so the file has to exist there.
 */
class FaviconFileService
{
    public function publish(?string $storagePath, ?string $webRoot = null): void
    {
        $target = rtrim($webRoot ?? public_path(), '/').'/favicon.ico';
        $disk = Storage::disk('public');

        if ($storagePath === null || $storagePath === '' || ! $disk->exists($storagePath)) {
            if (is_file($target)) {
                @unlink($target);
            }

            return;
        }

        copy($disk->path($storagePath), $target);
    }
}
