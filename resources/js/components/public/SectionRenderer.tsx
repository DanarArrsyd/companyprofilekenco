import { Link } from '@inertiajs/react';

import { CapabilityFeature, CapabilityFeatureItem } from '@/components/public/CapabilityFeature';
import { CertificationItem, CertificationItemData } from '@/components/public/CertificationItem';
import { ContactCTA } from '@/components/public/ContactCTA';
import { FacilityFeature, FacilityFeatureItem } from '@/components/public/FacilityFeature';
import { Hero, HeroContent } from '@/components/public/Hero';
import { ImagePlaceholder } from '@/components/public/ImagePlaceholder';
import { MetricStrip } from '@/components/public/MetricStrip';
import { ProductShowcase, ProductShowcaseItem } from '@/components/public/ProductShowcase';
import { SectionHeader } from '@/components/public/SectionHeader';
import { Button } from '@/components/ui/button';
import { PageSection } from '@/types/cms';

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
                            <div className="order-2 lg:order-1">
                                {section.title && <h2 className="text-h2 text-navy-900" style={{ textWrap: 'balance' }}>{section.title}</h2>}
                                {(section.subtitle || c.body) && (
                                    <p className="mt-4 text-body-lg text-slate-700">{section.subtitle ?? c.body}</p>
                                )}
                            </div>
                            <div className="order-1 aspect-[4/3] w-full bg-muted lg:order-2">
                                {c.image ? (
                                    <img src={`/storage/${c.image}`} alt={section.title ?? ''} loading="lazy" className="h-full w-full object-cover" />
                                ) : (
                                    <ImagePlaceholder />
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            );
        }

        // Generic-page primitives — unchanged from prior implementation.
        case 'text': {
            const body = (content as { body?: string }).body;
            return (
                <section className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8">
                    {section.title && <h2 className="text-h2 text-navy-900">{section.title}</h2>}
                    {(section.subtitle || body) && (
                        <p className="mt-4 max-w-2xl text-slate-700">{section.subtitle ?? body}</p>
                    )}
                </section>
            );
        }

        case 'image_text': {
            const c = content as { image?: string; body?: string };
            return (
                <section className="mx-auto max-w-content px-5 py-20 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
                        <div>
                            {section.title && <h2 className="text-h2 text-navy-900">{section.title}</h2>}
                            {(section.subtitle || c.body) && (
                                <p className="mt-4 text-slate-700">{section.subtitle ?? c.body}</p>
                            )}
                        </div>
                        {c.image ? (
                            <img src={c.image} alt={section.title ?? ''} className="w-full rounded" />
                        ) : (
                            <div className="flex h-64 items-center justify-center rounded border border-dashed border-border text-sm text-muted-foreground">
                                No image set
                            </div>
                        )}
                    </div>
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
                        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {images.map((src, index) => (
                                <img key={index} src={src} alt="" loading="lazy" className="aspect-square w-full rounded object-cover" />
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
                            <div>
                                <p className="text-caption uppercase text-muted-foreground">Quality</p>
                                <h2 className="mt-2 text-h2 text-navy-900" style={{ textWrap: 'balance' }}>{c.heading ?? section.title}</h2>
                                {(c.description || section.subtitle) && (
                                    <p className="mt-4 text-body text-slate-700">{c.description ?? section.subtitle}</p>
                                )}
                            </div>
                            {certs.length > 0 && (
                                <div className="flex items-start">
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
