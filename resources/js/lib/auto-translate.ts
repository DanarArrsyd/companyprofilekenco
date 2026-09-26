import type { router as InertiaRouter } from '@inertiajs/react';

/*
 * The admin "Auto-translate the other language" option. The choice is kept
 * per browser. Saves of translatable admin forms send `X-Auto-Translate: 1`
 * plus the language tab they were saved from (`X-Auto-Translate-Source`);
 * the server (SetLocale + AutoTranslateChanges) regenerates the other
 * language from that tab.
 */

const STORAGE_KEY = 'admin.autoTranslate';

// Used when storage is blocked (private mode, disabled site data).
let memory: boolean | null = null;

// The language tab the admin is looking at (ContentLocaleTabs keeps it current).
let source: 'en' | 'id' = 'en';

export function setAutoTranslateSource(locale: 'en' | 'id'): void {
    source = locale;
}

/** Only forms with translatable fields send a `translations` key (plain object or multipart). */
function carriesTranslations(data: unknown): boolean {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
        return [...data.keys()].some((key) => key.startsWith('translations['));
    }

    return typeof data === 'object' && data !== null && 'translations' in data;
}

export function autoTranslateEnabled(): boolean {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) return stored !== '0';
    } catch {
        // fall through to the in-memory choice
    }

    return memory ?? true;
}

export function setAutoTranslateEnabled(on: boolean): void {
    memory = on;

    try {
        localStorage.setItem(STORAGE_KEY, on ? '1' : '0');
    } catch {
        // the in-memory choice still applies for this page session
    }
}

/** Headers to add to a visit: admin writes of translatable forms, while the option is on. */
export function autoTranslateHeaders(method: string, pathname: string, data: unknown): Record<string, string> {
    const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

    return isAdmin && method.toLowerCase() !== 'get' && carriesTranslations(data) && autoTranslateEnabled()
        ? { 'X-Auto-Translate': '1', 'X-Auto-Translate-Source': source }
        : {};
}

export function registerAutoTranslateHeader(router: typeof InertiaRouter): void {
    router.on('before', (event) => {
        const visit = event.detail.visit;
        visit.headers = { ...visit.headers, ...autoTranslateHeaders(visit.method, visit.url.pathname, visit.data) };
    });
}
