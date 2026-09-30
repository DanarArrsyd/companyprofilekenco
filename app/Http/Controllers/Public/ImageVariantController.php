<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Services\ImageVariantService;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * First request for /storage/_variants/w{width}/{source}.webp: the web
 * server only routes here when the file is not on disk yet, so this builds
 * it once and every later request is a static file.
 */
class ImageVariantController extends Controller
{
    public function __invoke(ImageVariantService $variants, int $width, string $path): BinaryFileResponse
    {
        $source = substr($path, 0, -strlen('.webp'));
        $variant = $variants->ensure($source, $width);

        abort_if($variant === null, 404);

        return response()->file(Storage::disk('public')->path($variant), [
            'Content-Type' => 'image/webp',
            'Cache-Control' => 'public, max-age=604800',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
