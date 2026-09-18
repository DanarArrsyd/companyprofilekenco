import { AboutHero, AboutHeroContent } from '@/components/public/AboutHero';
import { SectionHeader } from '@/components/public/SectionHeader';
import { SectionRenderer } from '@/components/public/SectionRenderer';
import { SeoHead } from '@/components/public/SeoHead';
import PublicLayout from '@/layouts/PublicLayout';
import { CmsPage, ResolvedSeo } from '@/types/cms';

/**
 * Static eyebrow/H1 copy for the pages CLAUDE.md requires under /company —
 * matches the benchmark pattern used by Products/Facilities/Certifications
 * (a fixed banner per page type, not CMS-sourced). Any other standard page
 * falls back to its own title with no eyebrow.
 */
const HEADER_COPY: Record<string, { eyebrow: string; heading: string; description: string }> = {
    company: {
        eyebrow: 'Our Company',
        heading: 'Company',
        description: 'Who we are and how we build precision manufacturing for our customers.',
    },
    'company/vision-mission': {
        eyebrow: 'Our Direction',
        heading: 'Vision & Mission',
        description: 'The principles that guide how we manufacture, and where we aim to be.',
    },
};

/**
 * Slugs that get the full-bleed hero treatment (see AboutHero.tsx) instead
 * of the plain SectionHeader banner every other standard page uses, and
 * the fallback content shown until an admin adds a real 'hero' PageSection
 * to that page (see the merge logic in the component below — once such a
 * section exists, its own heading/description/highlight/image win).
 */
const ABOUT_HERO_CONTENT: Record<string, AboutHeroContent> = {
    company: {
        heading: 'Sekilas Tentang Kami',
        description: 'Didirikan pada tahun 2017, PT Kenco Manufactur Indonesia bergerak di bidang manufaktur dan metal stamping untuk mendukung kebutuhan industri otomotif. Didukung empat Business Unit, perusahaan terus berkembang dengan mengutamakan kualitas dan kepuasan pelanggan.',
        highlight: 'Berfokus pada solusi manufaktur yang efisien, berkualitas, dan sesuai kebutuhan pelanggan.',
        image: null,
    },
};

export default function Page({
    slug,
    page,
    seo,
    preview,
}: {
    slug: string;
    page: CmsPage | null;
    seo: ResolvedSeo;
    preview: boolean;
}) {
    const header = HEADER_COPY[slug];
    const aboutHeroDefaults = ABOUT_HERO_CONTENT[slug];

    // When an admin has added a real 'hero' PageSection to this page, its
    // content wins over the static fallback above — and it's excluded from
    // the generic sections loop below so it doesn't also render twice
    // through SectionRenderer's own (differently-styled) 'hero' case.
    const heroSection = aboutHeroDefaults ? page?.sections?.find((s) => s.section_type === 'hero') : undefined;
    const sections = heroSection ? (page?.sections ?? []).filter((s) => s.id !== heroSection.id) : page?.sections ?? [];

    const aboutHero: AboutHeroContent | undefined = aboutHeroDefaults && {
        heading: (heroSection?.content?.heading as string) || heroSection?.title || aboutHeroDefaults.heading,
        description: (heroSection?.content?.description as string) || aboutHeroDefaults.description,
        highlight: (heroSection?.content?.highlight as string) || aboutHeroDefaults.highlight,
        image: (heroSection?.content?.image as string) || aboutHeroDefaults.image,
    };

    return (
        <PublicLayout heroVariant={aboutHero ? 'transparent-light' : 'solid'}>
            <SeoHead seo={seo} />

            {preview && (
                <div className="bg-warning/10 px-5 py-2 text-center text-sm font-medium text-warning">
                    Draft preview — this page is not publicly visible.
                </div>
            )}

            {aboutHero ? (
                <AboutHero content={aboutHero} />
            ) : (
                <section className="border-b border-border">
                    <div className="mx-auto max-w-content px-5 py-16 sm:px-6 lg:px-8">
                        <SectionHeader
                            as="h1"
                            eyebrow={header?.eyebrow}
                            heading={header?.heading ?? page?.title ?? slug}
                            description={header?.description}
                        />
                    </div>
                </section>
            )}

            {sections.length > 0 ? (
                sections.map((section) => <SectionRenderer key={section.id} section={section} />)
            ) : (
                <p className="mx-auto max-w-content px-5 py-16 text-small text-muted-foreground sm:px-6 lg:px-8">
                    No content published yet.
                </p>
            )}
        </PublicLayout>
    );
}
