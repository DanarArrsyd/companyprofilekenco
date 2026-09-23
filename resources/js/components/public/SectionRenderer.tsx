import { Link } from '@inertiajs/react';
import { CSSProperties } from 'react';

import { CapabilityFeature, CapabilityFeatureItem } from '@/components/public/CapabilityFeature';
import { CertificationItem, CertificationItemData } from '@/components/public/CertificationItem';
import { ContactCTA } from '@/components/public/ContactCTA';
import { FacilityFeature, FacilityFeatureItem } from '@/components/public/FacilityFeature';
import { Hero, HeroContent } from '@/components/public/Hero';
import { ImagePlaceholder } from '@/components/public/ImagePlaceholder';
import { MetricStrip } from '@/components/public/MetricStrip';
import { ProductShowcase, ProductShowcaseItem } from '@/components/public/ProductShowcase';
import { SectionHeader } from '@/components/public/SectionHeader';
import { getSectionHeadingClass } from '@/components/public/section-heading';
import { Button } from '@/components/ui/button';
import { mediaUrl } from '@/lib/media';
import { PageSection } from '@/types/cms';
import paperTape1 from '../../../img/paper_tape1.png';
import paperTape2 from '../../../img/paper_tape2.png';
import { getTextSectionPresentation } from './text-section-presentation';

interface CtaContent {
    heading?: string;
    description?: string;
    cta_label?: string;
    cta_url?: string;
}

interface StatsContent {
    items?: { label: string; value: string }[];
}

interface PickerContent {
    heading?: string;
    description?: string;
    items?: (CapabilityFeatureItem | ProductShowcaseItem | FacilityFeatureItem)[];
}

/**
 * section_type values exclusive to the homepage (see SectionType::forHomepage())
 * get their purpose-built presentation here. Values also usable on generic
 * CMS pages (text/image_text/stats/hero/gallery/call_to_action — see
 * SectionType::forGenericPage()) keep their existing, page-agnostic markup
 * unchanged so Company/Vision pages are unaffected this phase.
 */
export function SectionRenderer({
    section,
    certifications,
    openJobCount,
}: {
    section: PageSection;
    certifications?: CertificationItemData[];
    openJobCount?: number;
}) {
    const content = section.content ?? {};

    switch (section.section_type) {
        case 'hero':
            return <Hero content={content as HeroContent} fallbackTitle={section.title ?? undefined} />;

        case 'company_intro': {
            const c = content as { image?: string; body?: string };
            if (!section.title && !section.subtitle && !c.body && !c.image) return null;

            return (
                <section className="border-t border-border">
                    <div className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.85fr_1fr] lg:gap-16">
                            <div data-reveal="left" className="order-2 lg:order-1">
                                {section.title && <h2 className="text-h2 text-navy-900" style={{ textWrap: 'balance' }}>{section.title}</h2>}
                                {(section.subtitle || c.body) && (
                                    <p className="mt-4 text-body-lg text-slate-700">{section.subtitle ?? c.body}</p>
                                )}
                            </div>
                            <div data-reveal="image" className="order-1 aspect-[4/3] w-full bg-muted lg:order-2">
                                {c.image ? (
                                    <img src={mediaUrl(c.image) ?? undefined} alt={section.title ?? ''} loading="lazy" className="h-full w-full object-cover" />
                                ) : (
                                    <ImagePlaceholder />
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            );
        }

        // Generic-page primitives.
        case 'text': {
            const presentation = getTextSectionPresentation(content, section.settings_json);

            if (presentation.variant === 'taped_image') {
                return (
                    <section className="overflow-hidden bg-background">
                        <div className="mx-auto grid max-w-content grid-cols-1 items-center gap-12 px-5 py-16 sm:px-6 md:py-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)] lg:gap-20 lg:px-8 lg:py-24">
                            <div data-reveal="left" className="relative z-10 text-navy-900">
                                {section.title && <h2 className={getSectionHeadingClass(section.settings_json)}>{section.title}</h2>}
                                {(section.subtitle || presentation.body) && (
                                    <p className="mt-5 max-w-3xl text-body-lg leading-relaxed text-slate-700">
                                        {section.subtitle ?? presentation.body}
                                    </p>
                                )}
                            </div>

                            <div data-reveal="image" className="relative mx-auto w-[min(86%,32rem)] py-8 sm:w-[min(78%,34rem)] lg:w-full lg:py-10">
                                <div className="relative -rotate-[5deg] transform-gpu">
                                    <div className="relative aspect-[4/3] overflow-hidden border border-navy-900/70 bg-muted shadow-sm">
                                        <img
                                            src={mediaUrl(presentation.image) ?? undefined}
                                            alt={section.title ?? 'Company manufacturing'}
                                            loading="lazy"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <img
                                        src={paperTape1}
                                        alt=""
                                        aria-hidden="true"
                                        className="pointer-events-none absolute -right-[10%] -top-[17%] z-20 w-[36%] rotate-[17deg] select-none opacity-90"
                                    />
                                    <img
                                        src={paperTape2}
                                        alt=""
                                        aria-hidden="true"
                                        className="pointer-events-none absolute -bottom-[18%] -left-[10%] z-20 w-[36%] -rotate-[12deg] select-none opacity-90"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                );
            }

            return (
                <section className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8">
                    {section.title && <h2 className={getSectionHeadingClass(section.settings_json)}>{section.title}</h2>}
                    {(section.subtitle || presentation.body) && (
                        <p className="mt-4 max-w-2xl text-slate-700">{section.subtitle ?? presentation.body}</p>
                    )}
                </section>
            );
        }

        case 'image_text': {
            const c = content as { image?: string; body?: string };
            return (
                <section className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
                        <div data-reveal="left">
                            {section.title && <h2 className="text-h2 text-navy-900">{section.title}</h2>}
                            {(section.subtitle || c.body) && (
                                <p className="mt-4 text-slate-700">{section.subtitle ?? c.body}</p>
                            )}
                        </div>
                        {c.image ? (
                            <img data-reveal="image" src={mediaUrl(c.image) ?? undefined} alt={section.title ?? ''} className="w-full rounded" />
                        ) : (
                            <div className="flex h-64 items-center justify-center rounded border border-dashed border-border text-sm text-muted-foreground">
                                No image set
                            </div>
                        )}
                    </div>
                </section>
            );
        }

        case 'vision_mission': {
            const c = content as {
                left_image?: string;
                right_image?: string;
                visi_title?: string;
                visi_text?: string;
                misi_title?: string;
                misi_text?: string;
            };

            const grayscalePhoto: CSSProperties = { filter: 'grayscale(1) contrast(1.08) brightness(1.05)' };

            return (
                <section className="relative isolate w-full overflow-hidden bg-navy-900 [--color-navy-900:5_31_65] lg:aspect-[1532/852] lg:max-h-[880px] lg:min-h-[560px]" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>
                    {/* Background — full-bleed factory photos, split left/right. */}
                    <div className="absolute inset-0 z-0 flex" aria-hidden="true">
                        <div className="h-full w-1/2">
                            {c.left_image ? (
                                <img src={mediaUrl(c.left_image) ?? undefined} alt="" className="h-full w-full object-cover" style={grayscalePhoto} />
                            ) : (
                                <ImagePlaceholder className="h-full" />
                            )}
                        </div>
                        <div className="h-full w-1/2">
                            {c.right_image ? (
                                <img src={mediaUrl(c.right_image) ?? undefined} alt="" className="h-full w-full object-cover" style={grayscalePhoto} />
                            ) : (
                                <ImagePlaceholder className="h-full" />
                            )}
                        </div>
                    </div>

                    {/* Coordinates follow the 1532 × 852 reference. Keep text independent
                        of the silhouettes so both headings share the same baseline. */}
                    <div className="absolute inset-0 z-10 hidden lg:block">
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-white"
                            style={{ clipPath: 'polygon(24.35% 16.43%, 50.4% 28.8%, 41.65% 90%, 13.3% 90%)' }}
                        />
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-navy-900"
                            // Extend both slanted sides behind the paper to hide the top edge.
                            style={{ clipPath: 'polygon(54.9% 0%, 83.28% 0%, 70.95% 76.3%, 44.97% 64.2%)' }}
                        />
                        <div className="absolute text-center text-navy-900" style={{ left: '23.7%', top: '32.2%', width: '20.2%' }}>
                            <h3 className="font-bold" style={{ fontSize: 'clamp(2.5rem, 4.18vw, 4.5rem)', lineHeight: 1.1 }}>
                                {c.visi_title || 'Vision'}
                            </h3>
                            {c.visi_text && (
                                <p className="mt-3" style={{ fontSize: 'clamp(0.875rem, 1.175vw, 1.25rem)', lineHeight: 1.3 }}>
                                    {c.visi_text}
                                </p>
                            )}
                        </div>
                        <div className="absolute text-center text-white" style={{ left: '51.5%', top: '32.2%', width: '22%' }}>
                            <h3 className="font-bold" style={{ fontSize: 'clamp(2.5rem, 4.18vw, 4.5rem)', lineHeight: 1.1 }}>
                                {c.misi_title || 'Mission'}
                            </h3>
                            {c.misi_text && (
                                <p className="mt-3" style={{ fontSize: 'clamp(0.875rem, 1.175vw, 1.25rem)', lineHeight: 1.3 }}>
                                    {c.misi_text}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Torn paper — foreground layer, above the panels, masking their
                        top/bottom edges (z-20 > panels' z-10) instead of framing behind them. */}
                    <img
                        src="/images/vision-mission-paper-top.png"
                        alt=""
                        aria-hidden="true"
                        className="absolute z-20 hidden max-w-none object-cover object-bottom lg:block"
                        style={{ height: '25%', left: '-5%', width: '110%', top: 0 }}
                    />
                    <img
                        src="/images/vision-mission-paper-bottom.png"
                        alt=""
                        aria-hidden="true"
                        className="absolute z-20 hidden max-w-none object-cover object-top lg:block"
                        style={{ height: '27%', left: '-5%', width: '110%', bottom: 0 }}
                    />

                    {/* Mobile/tablet — exact overlap geometry doesn't survive a narrow
                        viewport, so the panels stack instead of overlapping, but keep
                        the same angular silhouettes, contrast, and torn-paper framing. */}
                    <div className="relative z-10 flex flex-col gap-8 px-5 py-16 sm:px-6 lg:hidden">
                        <div
                            className="mx-auto w-full max-w-sm bg-[#fafafa] px-8 pb-10 pt-12 text-center"
                            style={{ clipPath: 'polygon(10% 0%, 100% 6%, 92% 100%, 0% 94%)' }}
                        >
                            <h3 className="text-h2 font-bold text-navy-900">{c.visi_title || 'Vision'}</h3>
                            {c.visi_text && <p className="mt-5 text-body text-slate-700">{c.visi_text}</p>}
                        </div>
                        <div
                            className="mx-auto w-full max-w-sm bg-navy-900 px-8 pb-10 pt-12 text-center"
                            style={{ clipPath: 'polygon(8% 0%, 100% 8%, 90% 100%, 0% 92%)' }}
                        >
                            <h3 className="text-h2 font-bold text-white">{c.misi_title || 'Mission'}</h3>
                            {c.misi_text && <p className="mt-5 text-body text-white/85">{c.misi_text}</p>}
                        </div>
                    </div>
                    <img
                        src="/images/vision-mission-paper-top.png"
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 z-20 h-16 w-full object-cover object-bottom sm:h-24 lg:hidden"
                    />
                    <img
                        src="/images/vision-mission-paper-bottom.png"
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 z-20 h-16 w-full object-cover object-top sm:h-24 lg:hidden"
                    />
                </section>
            );
        }

        case 'stats': {
            const c = content as StatsContent;
            return <MetricStrip items={c.items ?? []} />;
        }

        case 'gallery': {
            const images = (content as { images?: string[] }).images ?? [];
            return (
                <section className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8">
                    {section.title && <h2 className="text-h2 text-navy-900">{section.title}</h2>}
                    {images.length === 0 ? (
                        <p className="mt-4 text-sm text-slate-500">Gallery coming soon.</p>
                    ) : (
                        <div data-reveal-group className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {images.map((src, index) => (
                                <img key={index} src={mediaUrl(src) ?? undefined} alt="" loading="lazy" className="aspect-square w-full rounded object-cover" />
                            ))}
                        </div>
                    )}
                </section>
            );
        }

        case 'call_to_action': {
            const c = content as CtaContent;
            return (
                <section className="border-t border-border bg-muted">
                    <div className="mx-auto max-w-content px-5 py-16 text-center sm:px-6 lg:px-8">
                        <h2 className="text-h3 text-navy-900">{c.heading ?? section.title}</h2>
                        {(c.description || section.subtitle) && (
                            <p className="mx-auto mt-3 max-w-xl text-slate-700">{c.description ?? section.subtitle}</p>
                        )}
                        {c.cta_label && c.cta_url && (
                            <div className="mt-6 flex justify-center">
                                <Button asChild><a href={c.cta_url}>{c.cta_label}</a></Button>
                            </div>
                        )}
                    </div>
                </section>
            );
        }

        // Homepage-exclusive sections.
        case 'capabilities': {
            const c = content as PickerContent;
            const items = (c.items ?? []) as CapabilityFeatureItem[];
            if (items.length === 0) return null;

            return (
                <section className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8">
                    <SectionHeader
                        eyebrow="What We Do"
                        heading={c.heading ?? section.title}
                        description={c.description ?? section.subtitle ?? undefined}
                        cta={{ label: 'View All Capabilities', href: '/capabilities' }}
                    />
                    <div className="mt-4">
                        <CapabilityFeature items={items} />
                    </div>
                </section>
            );
        }

        case 'products': {
            const c = content as PickerContent;
            const items = (c.items ?? []) as ProductShowcaseItem[];
            if (items.length === 0) return null;

            return (
                <section className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8">
                    <SectionHeader
                        heading={c.heading ?? section.title}
                        description={c.description ?? section.subtitle ?? undefined}
                        cta={{ label: 'View All Products', href: '/products' }}
                    />
                    <div className="mt-10">
                        <ProductShowcase items={items} />
                    </div>
                </section>
            );
        }

        case 'facilities': {
            const c = content as PickerContent;
            const facility = (c.items?.[0] ?? null) as FacilityFeatureItem | null;
            if (!facility) return null;

            return (
                <section className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8">
                    <SectionHeader heading={c.heading ?? section.title} description={c.description ?? section.subtitle ?? undefined} />
                    <div className="mt-10">
                        <FacilityFeature facility={facility} />
                    </div>
                </section>
            );
        }

        case 'quality': {
            const c = content as CtaContent;
            const certs = certifications ?? [];
            if (!c.heading && !section.title && certs.length === 0) return null;

            return (
                <section className="border-t border-border">
                    <div className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr]">
                            <div data-reveal="left">
                                <p className="text-caption uppercase text-muted-foreground">Quality</p>
                                <h2 className="mt-2 text-h2 text-navy-900" style={{ textWrap: 'balance' }}>{c.heading ?? section.title}</h2>
                                {(c.description || section.subtitle) && (
                                    <p className="mt-4 text-body text-slate-700">{c.description ?? section.subtitle}</p>
                                )}
                            </div>
                            {certs.length > 0 && (
                                <div data-reveal="right" className="flex items-start">
                                    <CertificationItem items={certs} />
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            );
        }

        case 'career_cta': {
            const c = content as CtaContent;
            if (!c.heading && !section.title) return null;

            return (
                <section className="bg-charcoal">
                    <div className="mx-auto flex max-w-content flex-col items-start gap-6 px-5 py-14 sm:px-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                        <div>
                            <h2 className="text-h3 text-white">{c.heading ?? section.title}</h2>
                            {typeof openJobCount === 'number' && openJobCount > 0 && (
                                <p className="mt-2 text-body text-white/70">{openJobCount} open position{openJobCount === 1 ? '' : 's'} right now.</p>
                            )}
                        </div>
                        <Button asChild variant="secondary" className="border-white/30 text-white hover:bg-white/10">
                            <Link href="/careers">{c.cta_label ?? 'View Openings'}</Link>
                        </Button>
                    </div>
                </section>
            );
        }

        case 'contact_cta': {
            const c = content as CtaContent;
            return <ContactCTA heading={c.heading ?? section.title ?? undefined} description={c.description ?? section.subtitle ?? undefined} />;
        }

        default:
            return null;
    }
}
