import { ChevronLeft, ChevronRight } from 'lucide-react';
import { KeyboardEvent, TouchEvent, useId, useRef, useState } from 'react';

import { Container } from '@/components/public/Section';
import { useLocale } from '@/hooks/use-locale';
import { mediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

import arc from '../../../img/elemen_values.webp';

export interface OperatingValue {
    letter?: string;
    title?: string;
    description?: string | null;
    icon?: string | null;
}

export interface OperatingValuesContent {
    heading?: string;
    description?: string;
    eyebrow?: string;
    items?: OperatingValue[];
}

const WHEEL_STEP = 360;

/**
 * "Operating Values" (user reference, 2026-09-28): the heading on the left,
 * a wheel of the value icons that turns to bring the active value to the
 * top, and on the right the acronym (K.E.N.C.O) lighting up letter by letter
 * with the active value's title and description. Every value stays in the
 * HTML so crawlers read all of them; inactive ones are only hidden visually.
 * The letters are the tabs; arrows, the ‹ › buttons and swipes move between
 * them, wrapping around. No autoplay.
 */
export function OperatingValues({ content }: { content: OperatingValuesContent }) {
    const { t } = useLocale();
    const baseId = useId();
    const values = (content.items ?? []).filter((item) => item.title || item.letter);
    const [active, setActive] = useState(0);
    const touchStart = useRef<number | null>(null);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);

    if (values.length === 0) return null;

    const count = values.length;
    const step = WHEEL_STEP / count;
    const current = values[active];
    const go = (index: number, focus = false) => {
        const next = (index + count) % count;
        setActive(next);
        if (focus) tabs.current[next]?.focus();
    };
    // Relative moves read the latest index, so quick repeated clicks never skip or stall.
    const move = (delta: number) => setActive((previous) => (previous + delta + count) % count);

    const onTabKey = (event: KeyboardEvent) => {
        const moves: Record<string, number> = { ArrowRight: active + 1, ArrowDown: active + 1, ArrowLeft: active - 1, ArrowUp: active - 1, Home: 0, End: count - 1 };
        if (event.key in moves) {
            event.preventDefault();
            go(moves[event.key], true);
        }
    };

    const onTouchEnd = (event: TouchEvent) => {
        if (touchStart.current === null) return;
        const dx = event.changedTouches[0].clientX - touchStart.current;
        touchStart.current = null;
        if (Math.abs(dx) > 48) move(dx < 0 ? 1 : -1);
    };

    return (
        <section
            id="values"
            aria-roledescription="carousel"
            aria-label={content.heading || t('Operating values')}
            className="relative isolate scroll-mt-20 overflow-hidden bg-background font-montserrat text-navy-900"
            onTouchStart={(e) => {
                touchStart.current = e.touches[0].clientX;
            }}
            onTouchEnd={onTouchEnd}
        >
            <Container spacing="section">
                <div data-reveal="auto" className="max-w-[38rem]">
                    {content.heading && (
                        <h2 className="max-w-[10ch] text-[2.75rem] font-bold leading-[1.02] tracking-tight sm:text-[3.5rem] lg:text-[4.25rem]">{content.heading}</h2>
                    )}
                    {content.description && <p className="mt-4 text-body-lg leading-snug text-slate-700 lg:text-[1.375rem]">{content.description}</p>}
                </div>

                <div className="mt-12 grid grid-cols-1 items-center gap-14 lg:mt-8 lg:grid-cols-2 lg:gap-12">
                    {/* The wheel. The arc image is anchored to it (sizes in % of the wheel), matching the reference. */}
                    <div data-reveal="auto" className="relative mx-auto aspect-square w-[18rem] sm:w-[22rem] lg:w-[27rem]">
                        <img
                            src={arc}
                            alt=""
                            aria-hidden="true"
                            draggable={false}
                            className="pointer-events-none absolute left-[85%] top-[-64%] -z-10 w-[269%] max-w-none select-none"
                        />

                        <div className="absolute inset-0 rounded-full bg-slate-500/30" aria-hidden="true" />

                        <div
                            aria-hidden="true"
                            className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
                            style={{ transform: `rotate(${-active * step}deg)` }}
                        >
                            {values.map((value, index) => {
                                const angle = ((index * step - 90) * Math.PI) / 180;
                                const isActive = index === active;

                                return (
                                    <div
                                        key={index}
                                        className="absolute"
                                        style={{
                                            left: `${50 + 37 * Math.cos(angle)}%`,
                                            top: `${50 + 37 * Math.sin(angle)}%`,
                                            // Counter-rotate so every icon stays upright while the wheel turns.
                                            transform: `translate(-50%, -50%) rotate(${active * step}deg)`,
                                            transition: 'transform 700ms cubic-bezier(0.65, 0, 0.35, 1)',
                                        }}
                                    >
                                        <span
                                            className={cn(
                                                'flex h-[3.25rem] w-[3.25rem] items-center justify-center overflow-hidden rounded-full text-[1.375rem] font-bold transition-all duration-500 motion-reduce:transition-none sm:h-[4rem] sm:w-[4rem] lg:h-[4.5rem] lg:w-[4.5rem] lg:text-[1.75rem]',
                                                isActive ? 'scale-110 bg-navy-900 text-white' : 'bg-white/80 text-navy-900/50',
                                            )}
                                        >
                                            {value.icon ? <img src={mediaUrl(value.icon) ?? undefined} alt="" className="h-3/5 w-3/5 object-contain" /> : value.letter}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* The active value, large, in the centre. */}
                        <div aria-hidden="true" className="absolute left-1/2 top-1/2 flex h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white">
                            <span key={active} className="animate-[value-pop_500ms_cubic-bezier(0.16,1,0.3,1)] text-[3.5rem] font-bold leading-none text-navy-900 motion-reduce:animate-none lg:text-[5rem]">
                                {current.icon ? <img src={mediaUrl(current.icon) ?? undefined} alt="" className="h-[5rem] w-[5rem] object-contain lg:h-[6.5rem] lg:w-[6.5rem]" /> : current.letter}
                            </span>
                        </div>
                    </div>

                    <div data-reveal="auto" className="relative">
                        {content.eyebrow && <p className="font-caveat text-[2.5rem] leading-none text-navy-900 lg:text-[3.25rem]">{content.eyebrow}</p>}

                        <div role="tablist" aria-label={content.heading || t('Operating values')} onKeyDown={onTabKey} className="mt-1 flex flex-wrap items-baseline text-[3.25rem] font-bold leading-none tracking-tight sm:text-[4rem] lg:text-[4.5rem]">
                            {values.map((value, index) => {
                                const lit = index <= active;

                                return (
                                    <span key={index} className="flex items-baseline">
                                        {index > 0 && <span aria-hidden="true" className={cn('transition-colors duration-500', lit ? 'text-navy-900' : 'text-slate-500/35')}>.</span>}
                                        <button
                                            ref={(el) => {
                                                tabs.current[index] = el;
                                            }}
                                            type="button"
                                            role="tab"
                                            id={`${baseId}-tab-${index}`}
                                            aria-selected={index === active}
                                            aria-controls={`${baseId}-panel-${index}`}
                                            aria-label={value.title}
                                            tabIndex={index === active ? 0 : -1}
                                            onClick={() => go(index)}
                                            className={cn(
                                                'rounded-sm transition-colors duration-500 hover:text-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-700 focus-visible:ring-offset-4 focus-visible:ring-offset-background',
                                                lit ? 'text-navy-900' : 'text-slate-500/35',
                                            )}
                                        >
                                            {value.letter}
                                        </button>
                                    </span>
                                );
                            })}
                        </div>

                        {/* Every value is in the DOM; only the active one is shown. */}
                        <div className="mt-4 grid">
                            {values.map((value, index) => {
                                const isActive = index === active;

                                return (
                                    <div
                                        key={index}
                                        id={`${baseId}-panel-${index}`}
                                        role="tabpanel"
                                        aria-labelledby={`${baseId}-tab-${index}`}
                                        aria-hidden={!isActive}
                                        className={cn(
                                            'col-start-1 row-start-1 transition-all duration-500 motion-reduce:transition-none',
                                            isActive ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-2 opacity-0',
                                        )}
                                    >
                                        <h3 className="text-[1.75rem] font-bold leading-tight underline decoration-[0.12em] underline-offset-[0.2em] lg:text-[2.25rem]">{value.title}</h3>
                                        {value.description && <p className="mt-3 max-w-[34rem] text-body-lg leading-snug text-slate-700 lg:text-[1.375rem]">{value.description}</p>}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 flex items-center gap-8">
                            <button
                                type="button"
                                onClick={() => move(-1)}
                                aria-label={t('Previous value')}
                                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-navy-900 text-navy-900 transition-colors duration-200 hover:bg-navy-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-700 focus-visible:ring-offset-2"
                            >
                                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                onClick={() => move(1)}
                                aria-label={t('Next value')}
                                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-navy-900 text-navy-900 transition-colors duration-200 hover:bg-navy-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-700 focus-visible:ring-offset-2"
                            >
                                <ChevronRight className="h-6 w-6" aria-hidden="true" />
                            </button>
                            <p className="sr-only" aria-live="polite">
                                {t(':current of :total: :title', { current: active + 1, total: count, title: current.title ?? '' })}
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
