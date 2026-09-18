import { ImagePlaceholder } from '@/components/public/ImagePlaceholder';

export interface AboutHeroContent {
    heading: string;
    /** Rendered as plain text before the emphasized company name. */
    introBefore: string;
    /** The company name (or other phrase) rendered bold/emphasized within the intro paragraph. */
    introEmphasis: string;
    /** Rendered as plain text after the emphasized company name. */
    introAfter: string;
    /** Short right-aligned statement, e.g. a positioning line. */
    highlight: string;
    image?: string | null;
}

/**
 * Full-bleed page-intro hero for standard pages (Company/About today) that
 * want the same "image bleeds under a transparent header" treatment as the
 * homepage Hero, but with this page's own content shape: a large headline
 * top-left and two independent text blocks along the bottom instead of a
 * single CTA block. Deliberately a light/washed overlay with dark navy
 * text — the opposite contrast direction from Hero.tsx's dark-image/white
 * text, matching this page's reference design (a light industrial photo).
 */
export function AboutHero({ content }: { content: AboutHeroContent }) {
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

            {/* Subtle original accent line — a nod to the reference's
                decorative flourish without reproducing its mark. */}
            <svg
                className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 text-navy-900/15 sm:h-56 sm:w-56"
                viewBox="0 0 200 200"
                fill="none"
                aria-hidden="true"
            >
                <path d="M200 0C170 90 110 150 0 170" stroke="currentColor" strokeWidth="3" />
            </svg>

            <div className="relative mx-auto flex min-h-[560px] max-w-content flex-col justify-between px-5 pb-12 pt-28 sm:min-h-[640px] sm:px-6 sm:pt-32 lg:min-h-[720px] lg:px-8 lg:pb-16 lg:pt-36">
                <h1 className="max-w-3xl text-h1 text-navy-900" style={{ textWrap: 'balance' }}>
                    {content.heading}
                </h1>

                <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-12">
                    <p className="text-body text-slate-700">
                        {content.introBefore}
                        <span className="font-semibold text-navy-900">{content.introEmphasis}</span>
                        {content.introAfter}
                    </p>
                    <p className="text-body-lg text-navy-900 sm:text-right">{content.highlight}</p>
                </div>
            </div>
        </section>
    );
}
