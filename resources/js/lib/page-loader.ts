import type { router as inertiaRouter } from '@inertiajs/react';

import { shouldCover } from '@/lib/page-loader-rules';
import { pauseSmoothScroll, resumeSmoothScroll } from '@/lib/smooth-scroll';

type Router = typeof inertiaRouter;

/**
 * Public page loader (user reference, 2026-09-28). The curtain in
 * resources/views/app.blade.php covers the first paint; a runner crosses
 * under the logo while the page loads, and once it reaches the right edge
 * the curtain zooms through and fades away, like astra.co.id.
 *
 * - Full load / refresh: the curtain is already up; it opens when the app has
 *   mounted and the window has loaded (at least BOOT_MIN_MS from navigation
 *   start so the run reads, at most BOOT_CAP_MS so a slow asset never traps
 *   the visitor).
 * - Inertia visits to another public page: the curtain slides in from the
 *   left first, then the visit runs behind it and it opens when the new page
 *   is in (at least NAV_MIN_MS of running).
 * - Filters, pagination, same-page hashes, language switches, prefetches and
 *   partial reloads never show it (same path once the /en prefix is removed).
 */
const BOOT_MIN_MS = 1200;
const BOOT_CAP_MS = 3000;
const NAV_MIN_MS = 600;
const NAV_RUN = '1.1s';
const FINISH_MS = 300;
const COVER_MS = 550;
const OPEN_MS = 600;
const FADE_MS = 200;

let loader: HTMLElement | null = null;
let busy = false;
let bypassNext = false;

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function mover(): HTMLElement | null {
    return loader?.querySelector<HTMLElement>('.page-loader__mover') ?? null;
}

function lock(): void {
    document.documentElement.classList.add('page-loading');
    pauseSmoothScroll();
}

/** Restart the run from the left edge. */
function startRun(duration: string): void {
    const element = mover();
    if (!loader || !element) return;

    loader.style.setProperty('--pl-run', duration);
    element.style.transition = '';
    element.style.transform = '';
    loader.classList.remove('is-running');
    void element.offsetWidth;
    loader.classList.add('is-running');
}

/** Take the runner from wherever the run animation left it to the right edge. */
async function finishRun(): Promise<void> {
    const element = mover();
    if (!loader || !element || reducedMotion()) return;

    const current = getComputedStyle(element).transform;
    element.style.transform = current === 'none' ? '' : current;
    loader.classList.remove('is-running');
    void element.offsetWidth;
    element.style.transition = `transform ${FINISH_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    element.style.transform = 'translateX(100%)';
    await wait(FINISH_MS);
}

async function open(): Promise<void> {
    if (!loader) return;

    // Content reveals start as the curtain moves away.
    document.documentElement.classList.remove('page-loading');
    loader.dataset.state = 'leave';
    await wait(reducedMotion() ? FADE_MS : OPEN_MS);

    loader.hidden = true;
    delete loader.dataset.state;
    resumeSmoothScroll();
}

async function cover(): Promise<void> {
    if (!loader) return;

    lock();
    // Back to the start line before the curtain shows (the last run left the runner at the right edge).
    const element = mover();
    loader.classList.remove('is-running');
    if (element) {
        element.style.transition = '';
        element.style.transform = '';
    }
    loader.dataset.state = 'enter';
    loader.hidden = false;
    void loader.offsetWidth;
    loader.dataset.state = 'cover';
    await wait(reducedMotion() ? FADE_MS : COVER_MS);
    delete loader.dataset.state;
}

async function navigate(router: Router, url: URL, visit: Record<string, unknown>): Promise<void> {
    busy = true;

    try {
        await cover();
        startRun(NAV_RUN);

        const loaded = new Promise<void>((resolve) => {
            bypassNext = true;
            router.visit(url.href, {
                replace: Boolean(visit.replace),
                preserveScroll: Boolean(visit.preserveScroll),
                preserveState: Boolean(visit.preserveState),
                headers: (visit.headers as Record<string, string>) ?? {},
                onFinish: () => resolve(),
            });
        });

        await Promise.all([loaded, wait(NAV_MIN_MS)]);
        await finishRun();
        await open();
    } finally {
        busy = false;
    }
}

async function boot(): Promise<void> {
    if (!loader) return;

    lock();

    const loaded =
        document.readyState === 'complete' ? Promise.resolve() : new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }));

    await Promise.race([loaded, wait(Math.max(0, BOOT_CAP_MS - performance.now()))]);
    await wait(Math.max(0, BOOT_MIN_MS - performance.now()));
    await finishRun();
    await open();
}

/** Call once before the app mounts. */
export function registerPageLoader(router: Router): void {
    loader = document.getElementById('page-loader');
    if (!loader) return;

    router.on('before', (event) => {
        if (bypassNext) {
            bypassNext = false;
            return;
        }

        const visit = event.detail.visit;
        if (!shouldCover(visit, new URL(window.location.href))) return;

        // Hold the visit until the curtain has closed, then replay it behind the curtain.
        event.preventDefault();
        if (!busy) void navigate(router, visit.url, visit as unknown as Record<string, unknown>);
    });
}

/** Call once the app has rendered its first page. */
export function bootPageLoader(): void {
    void boot();
}
