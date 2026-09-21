import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Reveal-once scroll trigger via IntersectionObserver only — no animation
 * library. Respects prefers-reduced-motion by reporting "in view"
 * immediately so reduced-motion users never wait on a scroll trigger.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(threshold = 0.2) {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, inView };
}

export type RevealVariant = 'up' | 'left' | 'right' | 'scale' | 'fade';

/** Class pair to spread onto a reveal-once element. */
export function revealClass(inView: boolean, variant: RevealVariant = 'up'): string {
    return `scroll-reveal scroll-reveal--${variant}${inView ? ' is-revealed' : ''}`;
}

/** Keep collection entrances sequenced without making long lists feel slow. */
export function revealDelay(index: number, step = 80, maximum = 320): string {
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

function revealVariant(element: HTMLElement): RevealVariant {
    const requested = element.dataset.reveal;

    if (requested === 'left' || requested === 'right' || requested === 'scale' || requested === 'fade') {
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

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
            return;
        }

        const siblingIndexes = new Map<Element, number>();
        const targets = Array.from(root.querySelectorAll<HTMLElement>(AUTO_REVEAL_SELECTOR))
            .filter((element) => !element.closest('[data-reveal-skip]'))
            .filter((element) => !element.classList.contains('scroll-reveal'));

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add('is-revealed');
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.12,
                rootMargin: '0px 0px -8% 0px',
            },
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
