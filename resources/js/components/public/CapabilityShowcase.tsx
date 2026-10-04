import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { CSSProperties } from 'react';

import { Container } from '@/components/public/Section';
import { useLocale } from '@/hooks/use-locale';
import { responsiveImage } from '@/lib/responsive-image';

export interface CapabilityCardItem {
    id: number;
    name: string;
    slug: string;
    summary?: string | null;
    featured_image?: string | null;
}

/** Card width: one swipeable card on phones, two per row on tablets, four on desktop. */
const CARD_SIZES = '(min-width: 1024px) 20rem, (min-width: 640px) 50vw, 80vw';

function CapabilityCard({ item, index }: { item: CapabilityCardItem; index: number }) {
    const { localize } = useLocale();
    // Each photo drifts on its own phase so the four never move in step.
    const drift = { animationDelay: `${index * -4.5}s` } as CSSProperties;

    return (
        <Link
            href={localize(`/capabilities/${item.slug}`)}
            className="group/card relative isolate block aspect-[3/4] w-full lg:aspect-[5/8] overflow-hidden rounded-lg border-2 border-navy-950 bg-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-700 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
            {/* Hover zoom on the wrapper, the slow drift on the photo itself, so the two never fight over one transform. */}
            <div className="absolute inset-0 -z-10 transition-transform duration-700 ease-out group-hover/card:scale-[1.06] motion-reduce:transition-none">
                {item.featured_image ? (
                    <img
                        {...responsiveImage(item.featured_image, CARD_SIZES)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        style={drift}
                        className="capability-card__photo h-full w-full select-none object-cover"
                    />
                ) : (
                    <div className="h-full w-full bg-gradient-to-b from-gray-200 to-slate-500" aria-hidden="true" />
                )}
            </div>

            {/* Readability gradient: deepens on hover. */}
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950/90 via-navy-950/35 to-transparent transition-opacity duration-500 group-hover/card:opacity-0 motion-reduce:transition-none"
            />
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950 via-navy-950/60 to-navy-950/10 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100 motion-reduce:transition-none"
            />

            <ArrowUpRight
                aria-hidden="true"
                className="absolute right-4 top-4 h-6 w-6 -translate-x-1 translate-y-1 text-white opacity-0 transition-all duration-300 group-hover/card:translate-x-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-visible/card:opacity-100 motion-reduce:transition-none"
            />

            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <h3 className="font-montserrat text-[1.375rem] font-bold leading-tight text-white lg:text-[1.5rem]">{item.name}</h3>
                {item.summary && <p className="mt-2 line-clamp-4 text-small leading-relaxed text-white/90 lg:text-body">{item.summary}</p>}
            </div>
        </Link>
    );
}

/**
 * "Manufacturing Capabilities" (user reference 2026-10-04), shared by the
 * homepage section and /capabilities: a large heading and intro, then one
 * portrait card per capability — the photo slowly drifting (Ken Burns),
 * a dark gradient carrying the name and summary, the whole card linking to
 * the capability. Four across on desktop, two on tablets, and a swipeable
 * row on phones with the next card peeking in.
 */
export function CapabilityShowcase({
    items,
    heading,
    description,
    as: Heading = 'h2',
}: {
    items: CapabilityCardItem[];
    heading?: string | null;
    description?: string | null;
    as?: 'h1' | 'h2';
}) {
    const { t } = useLocale();

    return (
        <Container as="section" spacing="section" className="font-montserrat">
            <div data-reveal="auto" className="max-w-[44rem]">
                {heading && (
                    <Heading className="max-w-[12ch] text-balance text-[2.75rem] font-bold leading-[1.02] tracking-tight text-navy-900 sm:text-[3.5rem] lg:text-[4.25rem]">
                        {heading}
                    </Heading>
                )}
                {description && <p className="mt-4 text-body-lg leading-snug text-navy-900 lg:text-[1.375rem]">{description}</p>}
            </div>

            {items.length === 0 ? (
                <p className="mt-10 text-small text-muted-foreground">{t('No capabilities published yet.')}</p>
            ) : (
                <ul
                    data-reveal-group
                    className="-mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:mt-12 lg:grid-cols-4 lg:gap-8 [&::-webkit-scrollbar]:hidden"
                >
                    {items.map((item, index) => (
                        <li key={item.id} className="w-[80vw] max-w-[20rem] shrink-0 snap-start sm:w-auto sm:max-w-none">
                            <CapabilityCard item={item} index={index} />
                        </li>
                    ))}
                </ul>
            )}
        </Container>
    );
}
