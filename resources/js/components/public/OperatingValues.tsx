import { ChevronLeft, ChevronRight, ClipboardCheck, Handshake, LucideIcon, Recycle, RotateCw, ShieldCheck } from 'lucide-react';
import { CSSProperties, KeyboardEvent, TouchEvent, useId, useRef, useState } from 'react';

import { Container } from '@/components/public/Section';
import { useLocale } from '@/hooks/use-locale';
import { mediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';
import { labelArc, labelFlipped, sectorPath, shortestSteps, valueColor, WHEEL, wheelPoint } from '@/lib/value-wheel';

import arc from '../../../img/elemen_values.webp';
import people from '../../../img/people_wheel.png';

export interface OperatingValue {
    letter?: string;
    title?: string;
    description?: string | null;
    icon?: string | null;
    /** Wheel colour preset (green, yellow, red, blue, grey); defaults to the design order. */
    color?: string | null;
}

export interface OperatingValuesContent {
    heading?: string;
    description?: string;
    eyebrow?: string;
    items?: OperatingValue[];
}

/**
 * "Operating Values" (user reference 2026-09-28, wheel redesigned
 * 2026-09-29): the heading on the left, a coloured wheel of the values that
 * turns to bring the active value to the right, facing the text, and on the right the acronym (K.E.N.C.O) lighting up letter by letter
 * with the active value's title and description. Every value stays in the
 * HTML so crawlers read all of them; inactive ones are only hidden visually.
 * The letters are the tabs; clicking a slice or a letter, arrows, the ‹ ›
 * buttons and swipes move between them, wrapping around. No autoplay.
 */
export function OperatingValues({ content }: { content: OperatingValuesContent }) {
    const { t } = useLocale();
    const baseId = useId();
    const values = (content.items ?? []).filter((item) => item.title || item.letter);
    // Steps the wheel has turned, unbounded, so it always spins the short way and never unwinds.
    const [turn, setTurn] = useState(0);
    const touchStart = useRef<number | null>(null);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);

    if (values.length === 0) return null;

    const count = values.length;
    const active = ((turn % count) + count) % count;
    const current = values[active];
    const go = (index: number, focus = false) => {
        const next = ((index % count) + count) % count;
        setTurn((previous) => previous + shortestSteps(((previous % count) + count) % count, next, count));
        if (focus) tabs.current[next]?.focus();
    };
    // Relative moves read the latest turn, so quick repeated clicks never skip or stall.
    const move = (delta: number) => setTurn((previous) => previous + delta);

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
                    <div data-reveal="auto" className="relative mx-auto aspect-square w-[19rem] sm:w-[25rem] lg:w-[30rem]">
                        <img
                            src={arc}
                            alt=""
                            aria-hidden="true"
                            draggable={false}
                            className="pointer-events-none absolute left-[76%] top-[-58%] -z-10 w-[242%] max-w-none select-none"
                        />
                        <ValueWheel values={values} turn={turn} onPick={go} />
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

// Stand-ins in the artwork's style until the admin uploads the value icons.
const FALLBACK_ICONS: LucideIcon[] = [ShieldCheck, Recycle, ClipboardCheck, RotateCw, Handshake];
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';

/**
 * The wheel drawn in SVG from the user's artwork (resources/design/reference/wheelie_value.png):
 * each value is a coloured band with its name on an arc and a pastel slice
 * with its icon. The whole wheel turns; labels on the lower half switch to
 * an anticlockwise arc (crossfaded) so they always read upright. Mouse and
 * touch can pick a slice; keyboard and screen readers use the letter tabs,
 * so the drawing itself is hidden from assistive tech.
 */
function ValueWheel({ values, turn, onPick }: { values: OperatingValue[]; turn: number; onPick: (index: number) => void }) {
    const pathId = useId();
    const count = values.length;
    const step = 360 / count;
    const rotation = -turn * step;
    const iconSize = 68;

    return (
        <svg viewBox={`0 0 ${WHEEL.size} ${WHEEL.size}`} aria-hidden="true" className="relative block h-full w-full overflow-visible font-montserrat">
            <g
                className="transition-transform duration-[900ms] motion-reduce:transition-none"
                style={{ transform: `rotate(${rotation}deg)`, transformOrigin: `${WHEEL.centre}px ${WHEEL.centre}px`, transitionTimingFunction: EASE }}
            >
                {values.map((value, index) => {
                    const centre = index * step;
                    const color = valueColor(value.color, index);
                    const flipped = labelFlipped(centre, rotation);
                    const [ix, iy] = wheelPoint(WHEEL.iconRadius, centre);
                    const Icon = FALLBACK_ICONS[index % FALLBACK_ICONS.length];
                    const [nx, ny] = [Math.cos((centre * Math.PI) / 180), Math.sin((centre * Math.PI) / 180)];

                    return (
                        <g
                            key={index}
                            onClick={() => onPick(index)}
                            className="group/slice cursor-pointer"
                            style={{ '--nudge': `translate(${nx * 8}px, ${ny * 8}px)` } as CSSProperties}
                        >
                            <title>{value.title}</title>
                            <g className="transition-transform duration-300 ease-out group-hover/slice:[transform:var(--nudge)] motion-reduce:transition-none">
                                <path
                                    d={sectorPath(centre, step, WHEEL.bandInner, WHEEL.bandOuter)}
                                    className="stroke-navy-950"
                                    strokeWidth={3}
                                    strokeLinejoin="round"
                                    style={{ fill: `rgb(var(--color-value-${color}))` }}
                                />
                                <path
                                    d={sectorPath(centre, step, WHEEL.sliceInner, WHEEL.sliceOuter)}
                                    className="stroke-navy-950"
                                    strokeWidth={3}
                                    strokeLinejoin="round"
                                    style={{ fill: `rgb(var(--color-value-${color}-soft))` }}
                                />

                                {[false, true].map((reverse) => (
                                    <g key={String(reverse)} className="transition-opacity duration-500 motion-reduce:transition-none" style={{ opacity: reverse === flipped ? 1 : 0 }}>
                                        <path id={`${pathId}-${index}-${reverse ? 'r' : 'f'}`} d={labelArc(centre, step - 4, reverse)} fill="none" />
                                        <text className="fill-navy-900 font-bold" fontSize={24} dominantBaseline="central" textAnchor="middle">
                                            <textPath href={`#${pathId}-${index}-${reverse ? 'r' : 'f'}`} startOffset="50%">
                                                {value.title}
                                            </textPath>
                                        </text>
                                    </g>
                                ))}

                                {value.icon ? (
                                    <image href={mediaUrl(value.icon) ?? undefined} x={ix - iconSize / 2} y={iy - iconSize / 2} width={iconSize} height={iconSize} preserveAspectRatio="xMidYMid meet" />
                                ) : (
                                    <Icon x={ix - iconSize / 2} y={iy - iconSize / 2} width={iconSize} height={iconSize} className="text-navy-900" strokeWidth={2} />
                                )}
                            </g>
                        </g>
                    );
                })}
            </g>

            {/* The hub stays still. */}
            <circle cx={WHEEL.centre} cy={WHEEL.centre} r={WHEEL.hub} className="fill-white stroke-navy-950" strokeWidth={3} />
            <image href={people} x={WHEEL.centre - 58} y={WHEEL.centre - 48} width={116} height={97} />
        </svg>
    );
}
