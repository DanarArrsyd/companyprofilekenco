import type { CSSProperties, PropsWithChildren } from 'react';

import { revealClass, revealDelay, useInView } from '@/hooks/use-in-view';
import type { RevealVariant } from '@/hooks/use-in-view';

export function ScrollReveal({
    children,
    className = '',
    variant = 'up',
    delay = 0,
}: PropsWithChildren<{
    className?: string;
    variant?: RevealVariant;
    delay?: number;
}>) {
    const { ref, inView } = useInView<HTMLDivElement>(0.12);
    const style = { '--reveal-delay': revealDelay(delay) } as CSSProperties;

    return (
        <div ref={ref} className={`${revealClass(inView, variant)} ${className}`} style={style}>
            {children}
        </div>
    );
}

/** Children remain direct layout items; the page boundary supplies stagger. */
export function RevealGroup({
    children,
    className = '',
}: PropsWithChildren<{ className?: string }>) {
    return (
        <div className={className} data-reveal-group>
            {children}
        </div>
    );
}
