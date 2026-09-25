import { usePage } from '@inertiajs/react';

import { ImagePlaceholder } from '@/components/public/ImagePlaceholder';
import { Container } from '@/components/public/Section';

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
        <section className="relative isolate min-h-[35rem] w-full overflow-hidden bg-secondary sm:min-h-[40rem] lg:min-h-[45rem]">
            <div className="absolute inset-0">
                {content.image ? (
                    <img src={`/storage/${content.image}`} alt="" className="h-full w-full object-cover" loading="eager" />
                ) : (
                    <ImagePlaceholder className="h-full min-h-[35rem]" />
                )}
            </div>

            {/* Light wash so a real (desaturated) photo reads calm and the
                dark navy text/header controls stay legible over it — the
                opposite of Hero.tsx's dark overlay. Kept light enough that
                the photo itself still reads as the subject. */}
            <div className="absolute inset-0 bg-white/30" aria-hidden="true" />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/65 to-transparent sm:h-40" aria-hidden="true" />

            {/* Brand arc, anchored to the bottom-right corner and sized to
                enclose the highlight statement that sits inside it. */}
            <img
                src="/images/about-accent.png"
                alt=""
                className="pointer-events-none absolute -bottom-10 -right-10 w-[62%] max-w-none sm:-bottom-8 sm:right-0 sm:w-[54%] lg:-bottom-[30%] lg:-right-[10%] lg:w-[58%]"
                aria-hidden="true"
            />

            <Container className="relative flex min-h-[35rem] flex-col justify-between pb-12 pt-28 sm:min-h-[40rem] sm:pt-32 lg:min-h-[45rem] lg:pb-20 lg:pt-36">
                <h1
                    className="mx-auto max-w-4xl text-center text-h1 text-navy-900 sm:text-display lg:text-[4.75rem] lg:leading-[1.05]"
                    style={{ textWrap: 'balance' }}
                >
                    {content.heading}
                </h1>

                <div className="mt-16 grid grid-cols-1 items-end gap-10 sm:grid-cols-2 sm:gap-12">
                    <p className="text-body font-medium text-navy-900 sm:max-w-[26rem]">
                        {withCompanyNameEmphasis(content.description, siteSettings?.company_name)}
                    </p>
                    {content.highlight && (
                        <p className="text-body-lg font-semibold text-navy-900 sm:pb-6 sm:pl-10 sm:text-right lg:pb-10 lg:pl-16">
                            {content.highlight}
                        </p>
                    )}
                </div>
            </Container>
        </section>
    );
}
