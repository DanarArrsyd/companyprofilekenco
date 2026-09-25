import type { router as InertiaRouter } from '@inertiajs/react';

/*
 * The admin "Auto-translate the other language" option. The choice is kept
 * per browser and sent as `X-Auto-Translate: 1` on admin saves; the server
 * (SetLocale + AutoTranslateChanges) does the translating.
 */

const STORAGE_KEY = 'admin.autoTranslate';

// Used when storage is blocked (private mode, disabled site data).
let memory: boolean | null = null;

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

/** Headers to add to a visit: only admin writes, only while the option is on. */
export function autoTranslateHeaders(method: string, pathname: string): Record<string, string> {
    const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

    return isAdmin && method.toLowerCase() !== 'get' && autoTranslateEnabled() ? { 'X-Auto-Translate': '1' } : {};
}

export function registerAutoTranslateHeader(router: typeof InertiaRouter): void {
    router.on('before', (event) => {
        const visit = event.detail.visit;
        visit.headers = { ...visit.headers, ...autoTranslateHeaders(visit.method, visit.url.pathname) };
    });
}
