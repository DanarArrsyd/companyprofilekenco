import Lenis from 'lenis';

/**
 * Public-site inertial scrolling, matching astra.co.id's Lenis setup
 * (library defaults: lerp 0.1, wheel only — touch keeps native momentum).
 * One instance per page load; the public layout owns its lifetime.
 */
let instance: Lenis | null = null;

// Lenis ignores scrollTo while stopped, so a request made while an overlay
// is still closing runs once scrolling resumes.
let pendingTarget: HTMLElement | null = null;

export function startSmoothScroll(): () => void {
    if (typeof window === 'undefined' || instance) return () => undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => undefined;

    const lenis = new Lenis({ autoRaf: true });
    instance = lenis;

    return () => {
        lenis.destroy();
        if (instance === lenis) {
            instance = null;
            pendingTarget = null;
        }
    };
}

/** Freeze inertia while an overlay owns scrolling (e.g. the nav menu). */
export function pauseSmoothScroll(): void {
    instance?.stop();
}

/** Resume after an overlay closes; Lenis re-syncs to the native position. */
export function resumeSmoothScroll(): void {
    if (!instance) return;

    instance.start();

    if (pendingTarget) {
        instance.scrollTo(pendingTarget);
        pendingTarget = null;
    }
}

/** Scroll to an element through Lenis when active, natively otherwise. */
export function scrollToElement(element: HTMLElement): void {
    if (!instance) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    if (instance.isStopped) {
        pendingTarget = element;
        return;
    }

    instance.scrollTo(element);
}
