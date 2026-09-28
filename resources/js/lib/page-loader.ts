import type { router as inertiaRouter } from '@inertiajs/react';

import { shouldCover } from '@/lib/page-loader-rules';
import { pauseSmoothScroll, resumeSmoothScroll } from '@/lib/smooth-scroll';

type Router = typeof inertiaRouter;

/**
 * Public page loader (user reference, 2026-09-28). The curtain in
 * resources/views/app.blade.php covers the first paint; a runner crosses the
 * screen under the logo, edge to edge, while the page loads. Every lap ends
 * off-screen right: when the page is ready by then, the curtain follows the
 * runner out to the right, otherwise the runner starts another lap. The
 * motion never stops or jumps, it only decides at the end of a lap.
 *
 * - Full load / refresh: the curtain is already up and the first lap starts
 *   with the first paint; "ready" is app mounted + window load (capped at
 *   BOOT_CAP_MS so a slow asset never traps the visitor).
 * - Inertia visits to another public page: the curtain slides in from the
 *   left while the runner starts, the visit is replayed behind it, and it
 *   opens at the end of the first lap after the new page is in.
 * - Filters, pagination, same-page hashes, language switches, prefetches and
 *   partial reloads never show it (same path once the /en prefix is removed).
 */
const BOOT_CAP_MS = 3000;
const COVER_MS = 750;
const OPEN_MS = 950;
const FADE_MS = 200;
// One lap is 1.25s (--pl-lap in app.css).
const LAP_FALLBACK_MS = 1500;

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

/** Start lapping from off-screen left. */
function startRun(): void {
    const element = mover();
    if (!loader || !element) return;

    loader.classList.remove('is-running');
    void element.offsetWidth;
    loader.classList.add('is-running');
}

/**
 * Resolves at the end of the first lap that finishes after `ready`, with the
 * runner off-screen right. Without a running lap (reduced motion, or the
 * animation never started) it resolves as soon as `ready` does.
 */
function lapAfter(ready: Promise<void>): Promise<void> {
    const element = mover();

    return new Promise((resolve) => {
        let isReady = false;
        let done = false;

        const finish = () => {
            if (done) return;
            done = true;
            element?.removeEventListener('animationiteration', onLap);
            loader?.classList.remove('is-running');
            resolve();
        };

        // The runner's own shake and speed-line animations bubble their laps too; only the crossing counts.
        const onLap = (event: AnimationEvent) => {
            if (isReady && event.target === element && event.animationName === 'pl-lap') finish();
        };

        element?.addEventListener('animationiteration', onLap);

        void ready.then(() => {
            isReady = true;
            const running = element?.getAnimations().some((animation) => (animation as CSSAnimation).animationName === 'pl-lap' && animation.playState === 'running');
            if (!running) finish();
            // Safety net (e.g. a throttled background tab never fires the event): at most one more lap.
            else window.setTimeout(finish, LAP_FALLBACK_MS);
        });
    });
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

/** Slide in from the left; the runner sets off as the curtain arrives. */
async function cover(): Promise<void> {
    if (!loader) return;

    lock();
    loader.classList.remove('is-running');
    loader.dataset.state = 'enter';
    loader.hidden = false;
    void loader.offsetWidth;
    loader.dataset.state = 'cover';
    startRun();
    await wait(reducedMotion() ? FADE_MS : COVER_MS);
    delete loader.dataset.state;
}

async function navigate(router: Router, url: URL, visit: Record<string, unknown>): Promise<void> {
    busy = true;

    try {
        const loaded = cover().then(
            () =>
                new Promise<void>((resolve) => {
                    bypassNext = true;
                    router.visit(url.href, {
                        replace: Boolean(visit.replace),
                        preserveScroll: Boolean(visit.preserveScroll),
                        preserveState: Boolean(visit.preserveState),
                        headers: (visit.headers as Record<string, string>) ?? {},
                        onFinish: () => resolve(),
                    });
                }),
        );

        await lapAfter(loaded);
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
    const ready = Promise.race([loaded, wait(Math.max(0, BOOT_CAP_MS - performance.now()))]);

    await lapAfter(ready);
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
