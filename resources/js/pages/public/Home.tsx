import { usePage } from '@inertiajs/react';
import { ImageOff } from 'lucide-react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import { ArticlePreview, ArticlePreviewItem } from '@/components/public/ArticlePreview';
import { CertificationItemData } from '@/components/public/CertificationItem';
import { IndustryGrid, IndustryGridItem } from '@/components/public/IndustryGrid';
import { SectionHeader } from '@/components/public/SectionHeader';
import { SectionRenderer } from '@/components/public/SectionRenderer';
import { SeoHead } from '@/components/public/SeoHead';
import PublicLayout from '@/layouts/PublicLayout';
import { PageSection, ResolvedSeo } from '@/types/cms';

interface MilestoneItem {
    id: number;
    year: number;
    title: string;
    description: string | null;
    image?: string | null;
}

/**
 * Vertical space reserved above the rail so the marker sits at the same y
 * for every card regardless of how much text/image a given side holds — the
 * rail line is drawn at exactly this offset. MILESTONE_MARKER_GAP is the
 * single fixed distance kept between the marker and whatever sits directly
 * above/below it (year or image, in either pattern) — this is what makes
 * the alternating layout read as symmetric around the marker instead of
 * "flush on one side, padded on the other".
 */
const MILESTONE_ABOVE_HEIGHT = 190;
const MILESTONE_MARKER_GAP = 28;
const MILESTONE_MARKER_SIZE = 12;
const MILESTONE_RAIL_TOP = MILESTONE_ABOVE_HEIGHT + MILESTONE_MARKER_GAP + MILESTONE_MARKER_SIZE / 2;
const MILESTONE_ITEM_CLASS = 'w-[84vw] shrink-0 sm:w-[380px] lg:w-[440px]';
const MILESTONE_IMAGE_CLASS = 'aspect-[4/3] w-full max-w-[15rem] rounded-sm object-cover';

function MilestoneYear({ year }: { year: number }) {
    return (
        <p
            className="text-[36px] font-bold leading-none text-navy-900 sm:text-[48px]"
            style={{ fontVariantNumeric: 'tabular-nums' }}
        >
            {year}
        </p>
    );
}

/**
 * Restrained corporate placeholder so the final image slot is legible before
 * an admin uploads one — same footprint as the real image so nothing shifts
 * when it's replaced.
 */
function MilestonePlaceholder() {
    return (
        <div
            className={`flex flex-col items-center justify-center gap-2 border border-border bg-secondary text-muted-foreground ${MILESTONE_IMAGE_CLASS}`}
            role="img"
            aria-label="Milestone image not set"
        >
            <ImageOff className="h-5 w-5" aria-hidden="true" />
            <span className="text-caption">Image not set</span>
        </div>
    );
}

function MilestoneImage({ image, alt }: { image: string; alt: string }) {
    return (
        <img
            src={`/storage/${image}`}
            alt={alt}
            loading="lazy"
            className={MILESTONE_IMAGE_CLASS}
        />
    );
}

/** Fixed-height spacer that keeps the marker exactly MILESTONE_MARKER_GAP away from its neighbor on both sides, in both patterns. */
function MilestoneMarkerGap() {
    return <div aria-hidden="true" style={{ height: MILESTONE_MARKER_GAP }} />;
}

function MilestoneMarker() {
    return (
        <span
            className="z-10 shrink-0 rounded-full bg-navy-900 ring-4 ring-background"
            style={{ width: MILESTONE_MARKER_SIZE, height: MILESTONE_MARKER_SIZE }}
            aria-hidden="true"
        />
    );
}

/** Pattern A: description + year above the marker, image (or its placeholder) below. */
function MilestoneCardA({ item }: { item: MilestoneItem }) {
    return (
        <div className={`relative flex flex-col items-center text-center ${MILESTONE_ITEM_CLASS}`}>
            <div className="flex flex-col items-center justify-end" style={{ height: MILESTONE_ABOVE_HEIGHT }}>
                {item.description && (
                    <p className="mb-2 max-w-[18rem] text-small text-muted-foreground">{item.description}</p>
                )}
                <MilestoneYear year={item.year} />
            </div>

            <MilestoneMarkerGap />
            <MilestoneMarker />
            <MilestoneMarkerGap />

            <div className="flex flex-col items-center justify-start">
                {item.image ? <MilestoneImage image={item.image} alt={item.title} /> : <MilestonePlaceholder />}
            </div>
        </div>
    );
}

/** Pattern B: image (or its placeholder) above the marker, year + description below. */
function MilestoneCardB({ item }: { item: MilestoneItem }) {
    return (
        <div className={`relative flex flex-col items-center text-center ${MILESTONE_ITEM_CLASS}`}>
            <div className="flex flex-col items-center justify-end" style={{ height: MILESTONE_ABOVE_HEIGHT }}>
                {item.image ? <MilestoneImage image={item.image} alt={item.title} /> : <MilestonePlaceholder />}
            </div>

            <MilestoneMarkerGap />
            <MilestoneMarker />
            <MilestoneMarkerGap />

            <div className="flex flex-col items-center justify-start">
                <MilestoneYear year={item.year} />
                {item.description && <p className="mt-2 max-w-[18rem] text-small text-muted-foreground">{item.description}</p>}
            </div>
        </div>
    );
}

function IndustriesSection({ items }: { items: IndustryGridItem[] }) {
    if (items.length === 0) return null;

    return (
        <section className="border-t border-border">
            <div className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8">
                <SectionHeader eyebrow="Who We Serve" heading="Industries Served" cta={{ label: 'View All Industries', href: '/industries' }} />
                <div className="mt-10">
                    <IndustryGrid items={items} />
                </div>
            </div>
        </section>
    );
}

function MilestonesSection({ items }: { items: MilestoneItem[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const tickingRef = useRef(false);
    const [progress, setProgress] = useState(0);
    const [showLeftFade, setShowLeftFade] = useState(false);
    const [showRightFade, setShowRightFade] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const measure = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;

        const maxScroll = el.scrollWidth - el.clientWidth;
        const hasOverflow = maxScroll > 1;

        setProgress(hasOverflow ? Math.min(1, (el.scrollLeft + el.clientWidth) / el.scrollWidth) : 1);
        setShowLeftFade(hasOverflow && el.scrollLeft > 4);
        setShowRightFade(hasOverflow && el.scrollLeft < maxScroll - 4);

        let closestIndex = 0;
        let closestDistance = Infinity;
        cardRefs.current.forEach((card, index) => {
            if (!card) return;
            const distance = Math.abs(card.offsetLeft - el.scrollLeft);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });
        setActiveIndex(closestIndex);
    }, []);

    const scrollToItem = useCallback((index: number) => {
        cardRefs.current[index]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }, []);

    const onScroll = useCallback(() => {
        if (tickingRef.current) return;
        tickingRef.current = true;
        requestAnimationFrame(() => {
            measure();
            tickingRef.current = false;
        });
    }, [measure]);

    useEffect(() => {
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [measure, items.length]);

    if (items.length === 0) return null;

    return (
        <section className="border-t border-border bg-background">
            <div className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8">
                <SectionHeader eyebrow="Since Day One" heading="Company Milestones" />
            </div>

            <div className="relative mt-14">
                <div
                    ref={scrollRef}
                    onScroll={onScroll}
                    tabIndex={0}
                    role="group"
                    aria-label="Company milestones timeline. Scroll horizontally to see more."
                    className="scrollbar-hide overflow-x-auto pb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy-900"
                >
                    <div className="relative flex w-max min-w-full gap-x-8 px-5 sm:gap-x-14 sm:px-6 lg:gap-x-20 lg:px-8">
                        <div
                            className="pointer-events-none absolute left-5 right-5 h-px bg-border sm:left-6 sm:right-6 lg:left-8 lg:right-8"
                            style={{ top: MILESTONE_RAIL_TOP }}
                        />
                        <div
                            className="pointer-events-none absolute left-5 right-5 h-px origin-left bg-navy-900 transition-transform duration-150 ease-out sm:left-6 sm:right-6 lg:left-8 lg:right-8"
                            style={{ top: MILESTONE_RAIL_TOP, transform: `scaleX(${progress})` }}
                        />

                        {items.map((item, index) => (
                            <div key={item.id} ref={(el) => { cardRefs.current[index] = el; }} className="shrink-0">
                                {index % 2 === 0 ? <MilestoneCardA item={item} /> : <MilestoneCardB item={item} />}
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-14 transition-opacity duration-300 sm:w-20 lg:w-32 ${showLeftFade ? 'opacity-100' : 'opacity-0'}`}
                    style={{ background: 'linear-gradient(to right, rgb(var(--background)) 0%, rgb(var(--background) / 0) 100%)' }}
                />
                <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-14 transition-opacity duration-300 sm:w-20 lg:w-32 ${showRightFade ? 'opacity-100' : 'opacity-0'}`}
                    style={{ background: 'linear-gradient(to left, rgb(var(--background)) 0%, rgb(var(--background) / 0) 100%)' }}
                />
            </div>

            <div className="scrollbar-hide mx-auto mt-6 max-w-content overflow-x-auto px-5 sm:px-6 lg:px-8">
                <div className="flex w-max min-w-full justify-center gap-x-6 sm:gap-x-8">
                    {items.map((item, index) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => scrollToItem(index)}
                            aria-current={activeIndex === index ? 'true' : undefined}
                            className={`shrink-0 text-small transition-colors duration-200 ${
                                activeIndex === index ? 'font-bold text-navy-900' : 'text-muted-foreground hover:text-navy-700'
                            }`}
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {item.year}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}

function NewsSection({ articles }: { articles: ArticlePreviewItem[] }) {
    if (articles.length === 0) return null;

    return (
        <section className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8">
            <SectionHeader eyebrow="Newsroom" heading="Latest News" cta={{ label: 'View All News', href: '/news' }} />
            <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3">
                {articles.map((article) => <ArticlePreview key={article.id} article={article} />)}
            </div>
        </section>
    );
}

export default function Home({
    sections,
    seo,
    schema,
    latestArticles,
    certifications,
    industries,
    milestones,
    openJobCount,
}: {
    sections: PageSection[];
    seo: ResolvedSeo;
    schema?: Record<string, unknown>[];
    latestArticles: ArticlePreviewItem[];
    certifications: CertificationItemData[];
    industries: IndustryGridItem[];
    milestones: MilestoneItem[];
    openJobCount: number;
}) {
    const { siteSettings } = usePage().props;

    if (sections.length === 0) {
        return (
            <PublicLayout>
                <SeoHead seo={seo} schema={schema} />
                <div className="mx-auto max-w-content px-5 py-24 text-center sm:px-6 lg:px-8">
                    <h1 className="text-h1 text-navy-900">{siteSettings?.company_name ?? 'PT. Kenco Manufactur Indonesia'}</h1>
                    <p className="mt-4 text-slate-500">
                        Homepage content is being prepared. Check back soon.
                    </p>
                </div>
            </PublicLayout>
        );
    }

    const heroVariant = sections[0]?.section_type === 'hero' ? 'transparent-dark' : 'solid';

    return (
        <PublicLayout heroVariant={heroVariant}>
            <SeoHead seo={seo} schema={schema} />

            {sections.map((section) => (
                <Fragment key={section.id}>
                    {section.section_type === 'news' ? (
                        <NewsSection articles={latestArticles} />
                    ) : (
                        <SectionRenderer section={section} certifications={certifications} openJobCount={openJobCount} />
                    )}

                    {section.section_type === 'quality' && (
                        <>
                            <IndustriesSection items={industries} />
                            <MilestonesSection items={milestones} />
                        </>
                    )}
                </Fragment>
            ))}
        </PublicLayout>
    );
}
