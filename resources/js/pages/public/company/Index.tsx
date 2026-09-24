import { useEffect } from 'react';

import { AboutHero, AboutHeroContent } from '@/components/public/AboutHero';
import { FacilityFeature, FacilityFeatureItem } from '@/components/public/FacilityFeature';
import { IndustryGrid, IndustryGridItem } from '@/components/public/IndustryGrid';
import { SectionHeader } from '@/components/public/SectionHeader';
import { SectionRenderer } from '@/components/public/SectionRenderer';
import { SeoHead } from '@/components/public/SeoHead';
import { revealClass, useInView } from '@/hooks/use-in-view';
import { useLocale } from '@/hooks/use-locale';
import PublicLayout from '@/layouts/PublicLayout';
import { CmsPage, ResolvedSeo } from '@/types/cms';

/** Fallback hero copy (English source, shown through t()) until an admin adds a real 'hero' PageSection to the 'company' Page record. */
const ABOUT_HERO_DEFAULTS: AboutHeroContent = {
    heading: 'About Us at a Glance',
    description: 'Founded in 2017, PT Kenco Manufactur Indonesia works in manufacturing and metal stamping to support the automotive industry. Backed by four business units, the company keeps growing by putting quality and customer satisfaction first.',
    highlight: 'Focused on manufacturing solutions that are efficient, high-quality, and tailored to customer needs.',
    image: null,
};

function FacilityRow({ facility }: { facility: FacilityFeatureItem }) {
    const { ref, inView } = useInView<HTMLDivElement>();

    return (
        <div ref={ref} className={revealClass(inView)}>
            <FacilityFeature facility={facility} maxMachines={12} showLink={false} />
        </div>
    );
}

/**
 * /company — About, Vision & Mission, Facilities, and Industries as one
 * continuous scrollable page instead of four separate ones. The navbar's
 * "Company" submenu links here as #about / #vision-mission / #facilities /
 * #industries; each section carries a matching id + scroll-mt (offsetting
 * the fixed header) as the jump target.
 */
export default function CompanyIndex({
    aboutPage,
    visionPage,
    facilities,
    industries,
    seo,
}: {
    aboutPage: CmsPage | null;
    visionPage: CmsPage | null;
    facilities: FacilityFeatureItem[];
    industries: IndustryGridItem[];
    seo: ResolvedSeo;
}) {
    const { t } = useLocale();
    // Land on the requested section once its content has actually mounted —
    // the browser's own hash-scroll runs before React renders anything, so
    // it can't find the target on first paint.
    useEffect(() => {
        if (!window.location.hash) return;

        const target = document.getElementById(window.location.hash.slice(1));
        target?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }, []);

    const aboutHeroSection = aboutPage?.sections?.find((s) => s.section_type === 'hero');
    const aboutSections = aboutHeroSection
        ? (aboutPage?.sections ?? []).filter((s) => s.id !== aboutHeroSection.id)
        : (aboutPage?.sections ?? []);
    const aboutHero: AboutHeroContent = {
        heading: (aboutHeroSection?.content?.heading as string) || aboutHeroSection?.title || t(ABOUT_HERO_DEFAULTS.heading),
        description: (aboutHeroSection?.content?.description as string) || t(ABOUT_HERO_DEFAULTS.description),
        highlight: (aboutHeroSection?.content?.highlight as string) || t(ABOUT_HERO_DEFAULTS.highlight ?? ''),
        image: (aboutHeroSection?.content?.image as string) || ABOUT_HERO_DEFAULTS.image,
    };

    const visionSections = visionPage?.sections ?? [];

    return (
        <PublicLayout heroVariant="transparent-light">
            <SeoHead seo={seo} />

            <section id="about" className="scroll-mt-20">
                <AboutHero content={aboutHero} />
                {aboutSections.map((section) => <SectionRenderer key={section.id} section={section} />)}
            </section>

            <section id="vision-mission" className="scroll-mt-20 border-t border-border">
                {/* The 'vision_mission' split-card section is a full-bleed visual
                    with its own Visi/Misi headings — a plain banner above it would
                    just duplicate that. Only show the generic banner when the page
                    doesn't have that section (e.g. before an admin has set it up). */}
                {!visionSections.some((section) => section.section_type === 'vision_mission') && (
                    <div className="mx-auto max-w-content px-5 py-16 sm:px-6 lg:px-8">
                        <SectionHeader
                            eyebrow={t('Our Direction')}
                            heading={t('Vision & Mission')}
                            description={t('The principles that guide how we manufacture, and where we aim to be.')}
                        />
                    </div>
                )}
                {visionSections.map((section) => <SectionRenderer key={section.id} section={section} />)}
            </section>

            <section id="facilities" className="scroll-mt-20 border-t border-border">
                <div className="mx-auto max-w-content px-5 py-16 sm:px-6 lg:px-8">
                    <SectionHeader
                        eyebrow={t('Where We Manufacture')}
                        heading={t('Facilities')}
                        description={t('Our production sites and the equipment that runs on them.')}
                    />
                </div>

                {facilities.length === 0 ? (
                    <p className="mx-auto max-w-content px-5 pb-16 text-small text-muted-foreground sm:px-6 lg:px-8">
                        {t('No facilities published yet.')}
                    </p>
                ) : (
                    <div data-reveal-group className="mx-auto max-w-content space-y-16 px-5 pb-16 sm:px-6 lg:px-8">
                        {facilities.map((facility) => <FacilityRow key={facility.id} facility={facility} />)}
                    </div>
                )}
            </section>

            <section id="industries" className="scroll-mt-20 border-t border-border">
                <div className="mx-auto max-w-content px-5 py-16 sm:px-6 lg:px-8">
                    <SectionHeader eyebrow={t('Who We Serve')} heading={t('Industries')} description={t('Sectors we manufacture for.')} />
                </div>

                <div className="mx-auto max-w-content px-5 pb-16 sm:px-6 lg:px-8">
                    {industries.length === 0 ? (
                        <p className="text-small text-muted-foreground">{t('No industries published yet.')}</p>
                    ) : (
                        <IndustryGrid items={industries} showDescription />
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
