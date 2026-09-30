/**
 * Responsive sources for stored images (performance audit 2026-09-30).
 * Every jpg/png/webp on the public disk has WebP copies at these widths
 * under /storage/_variants/v{VARIANT_VERSION}/w{width}/{path}.webp, built on first request by
 * App\Services\ImageVariantService (keep the widths in sync with its
 * WIDTHS). The browser picks the smallest copy that covers `sizes`, so a
 * phone never downloads the 2000 px original.
 */
export const VARIANT_WIDTHS = [480, 960, 1440, 2000] as const;

/** Encoder version in the URL; keep in sync with ImageVariantService::VERSION. */
export const VARIANT_VERSION = 2;

const VARIANT_SOURCE = /^(?!_variants\/)[^\\]+\.(?:jpe?g|png|webp)$/i;

/** `sizes` for the common public layouts. */
export const IMAGE_SIZES = {
    full: '100vw',
    half: '(min-width: 1024px) 50vw, 100vw',
    third: '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
    content: '(min-width: 1280px) 80rem, 100vw',
    thumb: '12rem',
} as const;

export interface ImageSources {
    src?: string;
    srcSet?: string;
    sizes?: string;
}

function storagePath(path: string): string | null {
    const relative = path.startsWith('/storage/') ? path.slice('/storage/'.length) : path;

    if (/^(?:[a-z]+:|\/)/i.test(relative) || relative.split('/').some((part) => part === '..' || part === '.')) {
        return null;
    }

    return VARIANT_SOURCE.test(relative) ? relative : null;
}

/** Same as mediaUrl() in lib/media.ts, kept here so this module has no imports (node:test runs it directly). */
function publicUrl(path: string): string {
    return /^(?:[a-z]+:|\/)/i.test(path) ? path : `/storage/${path.replace(/^\/+/, '')}`;
}

export function variantUrl(path: string, width: number): string {
    return `/storage/_variants/v${VARIANT_VERSION}/w${width}/${path}.webp`;
}

/**
 * `src` / `srcSet` / `sizes` for an <img>. `sizes` describes how wide the
 * image is on screen (e.g. '(min-width: 1024px) 33vw, 100vw'). Anything that
 * is not a stored raster image (external URL, SVG, blob preview) is passed
 * through unchanged as `src`.
 */
export function responsiveImage(path: string | null | undefined, sizes: string): ImageSources {
    if (!path) return {};

    const stored = storagePath(path);

    if (!stored) {
        return { src: publicUrl(path) };
    }

    return {
        src: variantUrl(stored, 960),
        srcSet: VARIANT_WIDTHS.map((width) => `${variantUrl(stored, width)} ${width}w`).join(', '),
        sizes,
    };
}
