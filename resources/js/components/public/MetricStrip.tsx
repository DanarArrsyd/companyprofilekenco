import { useEffect, useState } from 'react';

import { useInView } from '@/hooks/use-in-view';

interface Metric {
    label: string;
    value: string;
}

function Figure({ value, animate }: { value: string; animate: boolean }) {
    const numeric = parseInt(value.replace(/[^\d]/g, ''), 10);
    const suffix = value.replace(/^[\d,.\s]+/, '');
    const prefix = value.match(/^[^\d]*/)?.[0] ?? '';
    const [display, setDisplay] = useState(animate && !Number.isNaN(numeric) ? 0 : numeric);

    useEffect(() => {
        if (!animate || Number.isNaN(numeric)) {
            setDisplay(Number.isNaN(numeric) ? 0 : numeric);
            return;
        }

        const duration = 900;
        const start = performance.now();

        function tick(now: number) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(numeric * eased));
            if (progress < 1) requestAnimationFrame(tick);
        }

        const frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [animate, numeric]);

    if (Number.isNaN(numeric)) {
        return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</span>;
    }

    return (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {prefix}{display.toLocaleString()}{suffix}
        </span>
    );
}

/**
 * Homepage stats band. Renders whatever metrics the admin has entered in
 * the Homepage CMS "stats" section — no invented figures.
 */
export function MetricStrip({ items }: { items: Metric[] }) {
    const { ref, inView } = useInView<HTMLDivElement>(0.4);

    if (items.length === 0) return null;

    return (
        <section className="border-y border-border bg-navy-900" ref={ref}>
            <div className="mx-auto max-w-content px-5 py-16 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 divide-y divide-white/15 lg:grid-cols-4 lg:divide-y-0 lg:divide-x">
                    {items.map((item, index) => (
                        <div key={index} className="px-2 py-6 text-center first:pl-0 last:pr-0 lg:py-4">
                            <p className="text-h2 text-white">
                                <Figure value={item.value} animate={inView} />
                            </p>
                            <p className="mt-2 text-caption uppercase text-white/60">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
