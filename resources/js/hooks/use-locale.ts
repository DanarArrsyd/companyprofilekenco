import { usePage } from '@inertiajs/react';

import { intlLocale, translate } from '@/lib/i18n';
import type { Replacements } from '@/lib/i18n';
import { DEFAULT_LOCALE, localizePath, localizedRouteName } from '@/lib/locale';
import type { Locale } from '@/lib/locale';
import { PageProps } from '@/types';

/** Current public locale plus helpers that keep links inside it. */
export function useLocale() {
    const { locale = DEFAULT_LOCALE, alternates = {} } = usePage<PageProps>().props;

    return {
        locale,
        alternates,
        /** Prefix an internal path for the current locale; external URLs pass through. */
        localize: (href: string) => localizePath(href, locale),
        /** Ziggy URL for a public route name in the current locale. */
        localizedRoute: (name: string, params?: string | number | Record<string, unknown>): string =>
            route(localizedRouteName(name, locale), params as never) as string,
        /** UI text in the current locale, keyed by its English source (":name" placeholders). */
        t: (key: string, replacements?: Replacements) => translate(key, locale, replacements),
        /** Locale-aware date, e.g. "24 Sep 2026". */
        formatDate: (value: string | Date, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) =>
            new Date(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value).toLocaleDateString(intlLocale(locale), options),
    };
}

export type { Locale };
