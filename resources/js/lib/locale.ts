/**
 * Public-site locale URL scheme — mirrors app/Support/Locale.php. Bahasa
 * Indonesia is the default at the root ("/products"); other locales are
 * prefixed ("/en/products").
 */
export type Locale = 'id' | 'en';

export const DEFAULT_LOCALE: Locale = 'id';

export const SUPPORTED_LOCALES: Locale[] = ['id', 'en'];

const NON_PAGE_PREFIXES = ['/admin', '/storage', '/build', '/sitemap.xml', '/robots.txt', '/up'];

const PREFIXED_LOCALES = SUPPORTED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

function isNonPagePath(path: string): boolean {
    return NON_PAGE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`));
}

/** Remove a locale prefix: "/en/products" → "/products", "/en" → "/". */
export function stripLocale(path: string): string {
    for (const locale of PREFIXED_LOCALES) {
        if (path === `/${locale}`) return '/';

        if (path.startsWith(`/${locale}/`) || path.startsWith(`/${locale}?`) || path.startsWith(`/${locale}#`)) {
            return path.slice(locale.length + 1) || '/';
        }
    }

    return path;
}

/**
 * Prefix an internal site path for a locale. External URLs, protocol links,
 * bare anchors and non-page paths (admin, storage…) pass through unchanged,
 * so CMS-entered CTA URLs can be fed straight in.
 */
export function localizePath(href: string, locale: Locale): string {
    if (!href.startsWith('/') || href.startsWith('//') || isNonPagePath(href)) return href;

    const bare = stripLocale(href);

    if (locale === DEFAULT_LOCALE) return bare;

    if (bare === '/') return `/${locale}`;

    return bare.startsWith('/?') || bare.startsWith('/#') ? `/${locale}${bare.slice(1)}` : `/${locale}${bare}`;
}

/** Ziggy route name for a public route in a locale ("public.news" → "en.public.news"). */
export function localizedRouteName(name: string, locale: Locale): string {
    return locale === DEFAULT_LOCALE ? name : `${locale}.${name}`;
}
