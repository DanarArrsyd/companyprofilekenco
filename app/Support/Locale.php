<?php

namespace App\Support;

use Illuminate\Http\Request;

/**
 * Public-site locales and their URL scheme: Bahasa Indonesia is the default
 * and lives at the root ("/products"); every other locale is prefixed
 * ("/en/products"). The admin CMS always runs in English.
 */
final class Locale
{
    public const DEFAULT = 'id';

    /** @var list<string> */
    public const SUPPORTED = ['id', 'en'];

    /** Locale implied by a request path. */
    public static function fromRequest(Request $request): string
    {
        if ($request->is('admin', 'admin/*')) {
            return 'en';
        }

        $first = $request->segment(1);

        return in_array($first, self::prefixedLocales(), true) ? $first : self::DEFAULT;
    }

    /** @return list<string> */
    public static function prefixedLocales(): array
    {
        return array_values(array_diff(self::SUPPORTED, [self::DEFAULT]));
    }

    public static function prefix(string $locale): string
    {
        return $locale === self::DEFAULT ? '' : '/'.$locale;
    }

    /**
     * Prefix an internal site path for a locale (defaults to the current
     * one). External URLs, anchors and non-page paths pass through.
     */
    public static function path(string $path, ?string $locale = null): string
    {
        if (! str_starts_with($path, '/') || str_starts_with($path, '//') || self::isNonPagePath($path)) {
            return $path;
        }

        $prefix = self::prefix($locale ?? app()->getLocale());
        $bare = self::strip($path);

        if ($prefix === '') {
            return $bare;
        }

        return $bare === '/' ? $prefix : $prefix.$bare;
    }

    /** Remove a locale prefix: "/en/products" → "/products", "/en" → "/". */
    public static function strip(string $path): string
    {
        foreach (self::prefixedLocales() as $locale) {
            if ($path === "/{$locale}") {
                return '/';
            }

            if (str_starts_with($path, "/{$locale}/") || str_starts_with($path, "/{$locale}?") || str_starts_with($path, "/{$locale}#")) {
                return substr($path, strlen($locale) + 1) ?: '/';
            }
        }

        return $path;
    }

    /**
     * Absolute URL of the current page in every supported locale, keeping
     * the query string (filters and pagination are shared across languages).
     *
     * @return array<string, string>
     */
    public static function alternates(Request $request): array
    {
        $path = self::strip('/'.ltrim($request->path(), '/'));
        $query = $request->getQueryString();

        $urls = [];
        foreach (self::SUPPORTED as $locale) {
            $urls[$locale] = url(self::path($path, $locale)).($query ? "?{$query}" : '');
        }

        return $urls;
    }

    private static function isNonPagePath(string $path): bool
    {
        foreach (['/admin', '/storage', '/build', '/sitemap.xml', '/robots.txt', '/up'] as $reserved) {
            if ($path === $reserved || str_starts_with($path, $reserved.'/') || str_starts_with($path, $reserved.'?')) {
                return true;
            }
        }

        return false;
    }
}
