import { usePage } from '@inertiajs/react';

import { ImagePlaceholder } from '@/components/public/ImagePlaceholder';

export interface AboutHeroContent {
    heading: string;
    description: string;
    /** Short second statement shown alongside the description — optional. */
    highlight?: string;
    image?: string | null;
}

/**
 * Bolds the first occurrence of the site's own company name inside a CMS
 * description, so an admin editing plain text still gets the emphasized
 * look — no rich-text field, no hardcoded company name.
 */
function withCompanyNameEmphasis(text: string, companyName?: string) {
    if (!companyName) return text;

    const index = text.indexOf(companyName);
    if (index === -1) return text;

    return (
        <>
            {text.slice(0, index)}
            <span className="font-semibold text-navy-900">{companyName}</span>
            {text.slice(index + companyName.length)}
        </>
    );
}

/**
 * Full-bleed page-intro hero for standard pages (Company/About today) that
 * want the same "image bleeds under a transparent header" treatment as the
 * homepage Hero, but with this page's own content shape: a centered
 * headline and, below it, a description alongside an optional short
 * highlight statement. Deliberately a light/washed overlay with dark navy
 * text — the opposite contrast direction from Hero.tsx's dark-image/white
 * text, matching this page's reference design (a light industrial photo).
 * Content comes from a real 'hero' PageSection when the admin has added
 * one (see resources/js/pages/public/Page.tsx); image path comes from the
 * same Media Library convention every other CMS image field uses.
 */
export function AboutHero({ content }: { content: AboutHeroContent }) {
    const { siteSettings } = usePage().props;

    return (
        <section className="relative isolate min-h-[560px] w-full overflow-hidden bg-secondary sm:min-h-[640px] lg:min-h-[720px]">
            <div className="absolute inset-0">
                {content.image ? (
                    <img src={`/storage/${content.image}`} alt="" className="h-full w-full object-cover" loading="eager" />
                ) : (
                    <ImagePlaceholder className="h-full min-h-[560px]" />
                )}
            </div>

            {/* Light wash so a real (desaturated) photo reads calm and the
                dark navy text/header controls stay legible over it — the
                opposite of Hero.tsx's dark overlay. */}
            <div className="absolute inset-0 bg-white/55" aria-hidden="true" />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/70 to-transparent sm:h-40" aria-hidden="true" />

            <img
                src="/images/about-accent.png"
                alt=""
                className="pointer-events-none absolute bottom-0 right-0 w-48 opacity-70 sm:w-64 lg:w-80"
                aria-hidden="true"
            />

            <div className="relative mx-auto flex min-h-[560px] max-w-content flex-col justify-between px-5 pb-12 pt-28 sm:min-h-[640px] sm:px-6 sm:pt-32 lg:min-h-[720px] lg:px-8 lg:pb-16 lg:pt-36">
                <h1 className="mx-auto max-w-3xl text-center text-h1 text-navy-900" style={{ textWrap: 'balance' }}>
                    {content.heading}
                </h1>

                <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-12">
                    <p className="text-body text-slate-700">{withCompanyNameEmphasis(content.description, siteSettings?.company_name)}</p>
                    {content.highlight && <p className="text-body-lg text-navy-900 sm:text-right">{content.highlight}</p>}
                </div>
            </div>
        </section>
    );
}
