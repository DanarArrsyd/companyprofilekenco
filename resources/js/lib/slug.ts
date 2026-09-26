/*
 * Slugs follow the server rule /^[a-z0-9]+(?:-[a-z0-9]+)*$/ (see the admin
 * FormRequests): lowercase ASCII words joined by single hyphens.
 */

/** "Précision Parts & Assembly" → "precision-parts-and-assembly". */
export function slugify(text: string): string {
    return text
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/** Tidies a slug while it is typed: lowercase, spaces become hyphens, a trailing hyphen is allowed. */
export function tidySlugInput(text: string): string {
    return text
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-+/, '');
}
