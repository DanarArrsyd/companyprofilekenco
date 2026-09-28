import type { router as inertiaRouter } from '@inertiajs/react';

import { shouldCover } from '@/lib/page-loader-rules';
import { createProgress, type Progress } from '@/lib/page-loader-progress';
import { pauseSmoothScroll, resumeSmoothScroll } from '@/lib/smooth-scroll';

type Router = typeof inertiaRouter;

/**
 * Public page loader (user reference, 2026-09-28). The curtain in
 * resources/views/app.blade.php covers the first paint. The runner's place on
 * the logo-wide rail IS the load progress, driven by real milestones, so it
 * creeps while the network is slow and dashes when data lands; there is one
 * pass only, and when the runner leaves the right end the curtain follows it
 * out to the right.
 *
 * - Full load / refresh: CSS carries the first stretch until this module
 *   runs; then app script loaded -> app mounted -> fonts -> window load
 *   (every image on screen). BOOT_CAP_MS keeps a dead asset from trapping
 *   the visitor.
 * - Inertia visits to another public page: the curtain slides in from the
 *   left, the visit is replayed behind it (request -> response and page swap
 *   -> the new page's on-screen images), then it opens.
 * - Filters, pagination, same-page hashes, language switches, prefetches and
 *   partial reloads never show it (same path once the /en prefix is removed).
 */
const BOOT_CAP_MS = 8000;
const IMAGES_CAP_MS = 4000;
const COVER_MS = 750;
const OPEN_MS = 950;
const FADE_MS = 200;

let loader: HTMLElement | null = null;
let busy = false;
let bypassNext = false;
let progress: Progress | null = null;

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function parts() {
    return {
        track: loader?.querySelector<HTMLElement>('.page-loader__track') ?? null,
        mover: loader?.querySelector<HTMLElement>('.page-loader__mover') ?? null,
        fill: loader?.querySelector<HTMLElement>('.page-loader__fill') ?? null,
    };
}

function startProgress(from: number): Progress | null {
    const { track, mover, fill } = parts();
    if (!loader || !track || !mover || !fill || reducedMotion()) return null;

    progress?.stop();
    progress = createProgress({ track, mover, fill }, from);
    return progress;
}

/** Where the pre-JS CSS stretch has got to, as a fraction of the rail. */
function bootPosition(): number {
    const { track, mover } = parts();
    if (!track || !mover || track.clientWidth === 0) return 0;

    const x = new DOMMatrix(getComputedStyle(mover).transform).m41;
    return Math.max(0, (x + mover.offsetWidth) / track.clientWidth);
}

function lock(): void {
    document.documentElement.classList.add('page-loading');
    pauseSmoothScroll();
}

/** Resolves once every image currently on screen has loaded (or failed), capped. */
function onScreenImages(onEach: (done: number, total: number) => void): Promise<void> {
    const pending = [...document.querySelectorAll<HTMLImageElement>('#app img')].filter((image) => {
        if (image.complete) return false;
        const rect = image.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0;
    });

    if (pending.length === 0) return Promise.resolve();

    let done = 0;
    const all = Promise.all(
        pending.map(
            (image) =>
                new Promise<void>((resolve) => {
                    const settle = () => {
                        done += 1;
                        onEach(done, pending.length);
                        resolve();
                    };
                    image.addEventListener('load', settle, { once: true });
                    image.addEventListener('error', settle, { once: true });
                }),
        ),
    ).then(() => undefined);

    return Promise.race([all, wait(IMAGES_CAP_MS)]);
}

async function open(): Promise<void> {
    if (!loader) return;

    // Content reveals start as the curtain moves away.
    document.documentElement.classList.remove('page-loading');
    loader.dataset.state = 'leave';
    await wait(reducedMotion() ? FADE_MS : OPEN_MS);

    loader.hidden = true;
    delete loader.dataset.state;
    progress?.stop();
    progress = null;
    resumeSmoothScroll();
}

/** Slide in from the left with the runner back at the start of the rail. */
async function cover(): Promise<void> {
    if (!loader) return;

    lock();
    loader.classList.remove('is-booting');
    loader.dataset.state = 'enter';
    loader.hidden = false;
    startProgress(0);
    void loader.offsetWidth;
    loader.dataset.state = 'cover';
    await wait(reducedMotion() ? FADE_MS : COVER_MS);
    delete loader.dataset.state;
}

async function navigate(router: Router, url: URL, visit: Record<string, unknown>): Promise<void> {
    busy = true;

    try {
        void cover();

        // Request the page once the curtain is ~93% across (easeInOutQuint at 2/3 of its time): the
        // response always lands after it has closed.
        await wait(reducedMotion() ? FADE_MS : Math.round(COVER_MS * 0.67));
        progress?.stage(0.12);

        await new Promise<void>((resolve) => {
            bypassNext = true;
            router.visit(url.href, {
                replace: Boolean(visit.replace),
                preserveScroll: Boolean(visit.preserveScroll),
                preserveState: Boolean(visit.preserveState),
                headers: (visit.headers as Record<string, string>) ?? {},
                onFinish: () => resolve(),
            });
        });
        progress?.stage(0.7);

        // Let React commit the new page before looking for its images.
        await wait(50);
        await onScreenImages((done, total) => progress?.stage(0.7 + 0.25 * (done / total)));

        await (progress?.complete() ?? Promise.resolve());
        await open();
    } finally {
        busy = false;
    }
}

async function boot(): Promise<void> {
    if (!loader) return;

    busy = true;
    lock();

    try {
        const loaded =
            document.readyState === 'complete' ? Promise.resolve() : new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }));
        void document.fonts?.ready.then(() => progress?.stage(0.6));

        await Promise.race([loaded, wait(Math.max(0, BOOT_CAP_MS - performance.now()))]);
        await (progress?.complete() ?? Promise.resolve());
        await open();
    } finally {
        busy = false;
    }
}

/** Call once before the app mounts. */
export function registerPageLoader(router: Router): void {
    loader = document.getElementById('page-loader');
    if (!loader) return;

    // Take over from the CSS stretch exactly where it is, so there is no jump.
    const from = bootPosition();
    loader.classList.remove('is-booting');
    startProgress(from)?.stage(0.2);

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
    progress?.stage(0.45);
    void boot();
}
