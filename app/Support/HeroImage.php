<?php

namespace App\Support;

use App\Services\ImageVariantService;

/**
 * The full-width hero photo of a public page, read from the Inertia page
 * the HTML shell is about to render. The site has no SSR, so without a
 * preload the browser only discovers this image after the JavaScript has
 * run; the head preloads it (see app.blade.php) so it downloads in
 * parallel with the scripts. It is the page's LCP element and what the
 * page loader waits for.
 */
class HeroImage
{
    /** @return array{srcset: string, sizes: string}|null */
    public static function preload(array $page): ?array
    {
        $props = $page['props'] ?? [];

        $sections = match ($page['component'] ?? null) {
            'public/Home' => $props['sections'] ?? [],
            'public/company/Index' => $props['aboutPage']['sections'] ?? [],
            default => [],
        };

        $sections = collect($sections)->map(fn ($section) => is_array($section) ? $section : (array) json_decode(json_encode($section), true));
        $hero = $sections->first(fn (array $section) => ($section['section_type'] ?? null) === 'hero');
        $image = $hero['content']['image'] ?? null;
        $srcset = is_string($image) ? app(ImageVariantService::class)->srcset($image) : null;

        return $srcset ? ['srcset' => $srcset, 'sizes' => '100vw'] : null;
    }
}
