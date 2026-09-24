import { usePage } from '@inertiajs/react';

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
    };
}

export type { Locale };
