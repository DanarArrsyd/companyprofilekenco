import { useEffect, useRef, useState } from 'react';

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

/** Class pair to spread onto a section-reveal element: ref + className. */
export function revealClass(inView: boolean): string {
    return inView
        ? 'opacity-100 translate-y-0 transition-all duration-500 ease-out'
        : 'opacity-0 translate-y-4 transition-all duration-500 ease-out';
}
