import id from '../../../lang/id.json' with { type: 'json' };

// Type-only import keeps this module loadable by the Node test runner.
import type { Locale } from './locale';

/**
 * UI string catalogues, keyed by the English source text — the same
 * lang/{locale}.json files Laravel's __() reads, so server and client share
 * one source. English needs no catalogue: the key is the text.
 */
const catalogues: Partial<Record<Locale, Record<string, string>>> = { id };

export type Replacements = Record<string, string | number>;

/** Translate English source text; missing entries fall back to the source. */
export function translate(key: string, locale: Locale = 'id', replacements: Replacements = {}): string {
    const text = catalogues[locale]?.[key] || key;

    return Object.entries(replacements).reduce(
        (result, [name, value]) => result.replaceAll(`:${name}`, String(value)),
        text,
    );
}

/** BCP 47 tag for Intl date/number formatting. */
export function intlLocale(locale: Locale): string {
    return locale === 'id' ? 'id-ID' : 'en-GB';
}
