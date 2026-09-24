import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Astra-style trigger line: content reveals once its top edge rises 150px
 * above the viewport bottom (astra.co.id hero: `top < innerHeight - 150`).
 */
export const REVEAL_TRIGGER_OFFSET = 150;

export const scrollRevealObserverOptions = {
    // A clipped image exposes almost no painted area before reveal. The zero
    // threshold lets the trigger line decide instead of painted area.
    threshold: 0,
    rootMargin: `0px 0px -${REVEAL_TRIGGER_OFFSET}px 0px`,
} as const;

/**
 * Bidirectional reveal rule. Entering the trigger zone reveals; dropping
 * back below the trigger line (user scrolls up) hides again so the block
 * fades back in on the next pass. Leaving through the top keeps it visible,
 * which avoids content blinking out while it is still being read.
 */
export function resolveRevealState(
    isIntersecting: boolean,
    top: number,
    triggerLine: number,
    current: boolean,
): boolean {
    if (isIntersecting) return true;
    if (top >= triggerLine) return false;

    return current;
}

function triggerLineFor(entry: IntersectionObserverEntry): number {
    return entry.rootBounds?.bottom ?? window.innerHeight - REVEAL_TRIGGER_OFFSET;
}

function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Scroll trigger via IntersectionObserver only. Fades in and out as the
 * element crosses the trigger line; pass `once` for effects that should
 * not replay (e.g. counters). Reduced-motion users get "in view" at once.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
    threshold = 0,
    { once = false }: { once?: boolean } = {},
) {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
            setInView(true);
            return;
        }

        let revealed = false;
        const observer = new IntersectionObserver(
            ([entry]) => {
                revealed = resolveRevealState(
                    entry.isIntersecting,
                    entry.boundingClientRect.top,
                    triggerLineFor(entry),
                    revealed,
                );
                setInView(revealed);

                if (revealed && once) observer.disconnect();
            },
            { ...scrollRevealObserverOptions, threshold },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [threshold, once]);

    return { ref, inView };
}

export type RevealVariant = 'up' | 'left' | 'right' | 'scale' | 'fade' | 'image';

/** Class pair to spread onto a scroll-revealed element. */
export function revealClass(inView: boolean, variant: RevealVariant = 'up'): string {
    return `scroll-reveal scroll-reveal--${variant}${inView ? ' is-revealed' : ''}`;
}

/** Astra staggers sibling entrances by 140ms; cap so long lists stay quick. */
export function revealDelay(index: number, step = 140, maximum = 420): string {
    const normalizedIndex = Number.isFinite(index) ? Math.max(0, index) : 0;

    return `${Math.min(normalizedIndex * step, maximum)}ms`;
}

const AUTO_REVEAL_SELECTOR = [
    '[data-reveal]:not([data-reveal="none"])',
    ':scope > div > h1',
    ':scope > div > p',
    ':scope > div > article',
    ':scope > div > form',
    ':scope > div > div',
    'section > div > h1',
    'section > div > h2',
    'section > div > h3',
    'section > div > p',
    'section > div > article',
    'section > div > form',
    'section > div > div',
    'section li',
    '[data-reveal-group] > *',
].join(',');

function isExplicitRevealTarget(target: unknown): boolean {
    const element = target as HTMLElement;

    return element.hasAttribute('data-reveal') || Boolean(element.parentElement?.hasAttribute('data-reveal-group'));
}

/** Prefer deliberate component-level motion over an automatic wrapper reveal. */
export function preferExplicitRevealTargets<T>(targets: T[]): T[] {
    const explicitTargets = targets.filter(isExplicitRevealTarget);

    return targets.filter((target) => (
        isExplicitRevealTarget(target)
        || !explicitTargets.some((explicitTarget) => (
            explicitTarget !== target
            && (target as HTMLElement).contains(explicitTarget as Node)
        ))
    ));
}

function revealVariant(element: HTMLElement): RevealVariant {
    const requested = element.dataset.reveal;

    if (requested === 'left' || requested === 'right' || requested === 'scale' || requested === 'fade' || requested === 'image') {
        return requested;
    }

    return 'up';
}

/**
 * Apply one shared observer to meaningful content blocks under the public
 * page root. Markup can override direction with data-reveal or opt out by
 * placing itself under data-reveal-skip.
 */
export function useScrollRevealBoundary<T extends HTMLElement>(
    rootRef: RefObject<T>,
    dependency: unknown,
): void {
    useBrowserLayoutEffect(() => {
        const root = rootRef.current;
        if (!root || typeof window === 'undefined') return;

        if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
            return;
        }

        const siblingIndexes = new Map<Element, number>();
        const candidates = Array.from(root.querySelectorAll<HTMLElement>(AUTO_REVEAL_SELECTOR))
            .filter((element) => !element.closest('[data-reveal-skip]'))
            .filter((element) => !element.classList.contains('scroll-reveal'));
        const targets = preferExplicitRevealTargets(candidates);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const revealed = resolveRevealState(
                        entry.isIntersecting,
                        entry.boundingClientRect.top,
                        triggerLineFor(entry),
                        entry.target.classList.contains('is-revealed'),
                    );

                    entry.target.classList.toggle('is-revealed', revealed);
                });
            },
            scrollRevealObserverOptions,
        );

        targets.forEach((element) => {
            const parent = element.parentElement ?? root;
            const siblingIndex = siblingIndexes.get(parent) ?? 0;
            siblingIndexes.set(parent, siblingIndex + 1);

            element.classList.add(...revealClass(false, revealVariant(element)).split(' '));
            element.style.setProperty('--reveal-delay', revealDelay(siblingIndex));
            observer.observe(element);
        });

        return () => observer.disconnect();
    }, [dependency, rootRef]);
}
