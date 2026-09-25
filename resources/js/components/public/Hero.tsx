import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import { ImagePlaceholder } from '@/components/public/ImagePlaceholder';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/use-locale';
import { mediaUrl } from '@/lib/media';

export interface HeroContent {
    eyebrow?: string;
    heading?: string;
    description?: string;
    image?: string;
    primary_cta_label?: string;
    primary_cta_url?: string;
    secondary_cta_label?: string;
    secondary_cta_url?: string;
}

/**
 * Homepage hero — asymmetric text/image split. The image is the LCP
 * candidate: eager-loaded, fetchpriority high, no entrance animation.
 * Only the text block reveals on load.
 */
export function Hero({ content, fallbackTitle }: { content: HeroContent; fallbackTitle?: string }) {
    const { localize } = useLocale();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => setReady(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const heading = content.heading ?? fallbackTitle;
    if (!heading) return null;

    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const textState = ready || reduced
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-3';

    return (
        <section data-reveal-skip className="relative isolate min-h-[35rem] w-full overflow-hidden bg-navy-900 sm:min-h-[40rem] lg:min-h-[47.5rem]">
            <div className="absolute inset-0">
                {content.image ? (
                    <img
                        src={mediaUrl(content.image) ?? undefined}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="eager"
                        // @ts-expect-error fetchpriority is valid HTML but not yet in React's DOM typings
                        fetchpriority="high"
                    />
                ) : (
                    <ImagePlaceholder className="h-full min-h-[35rem]" />
                )}
            </div>

            {/* Dark overlay/gradient — the hero's own readability layer for the
                transparent header on top of it, not a separate navbar background. */}
            <div className="absolute inset-0 bg-navy-900/20" aria-hidden="true" />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-navy-900/70 to-transparent sm:h-40" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-navy-900/80 via-navy-900/30 to-transparent" aria-hidden="true" />

            <div className="relative mx-auto flex min-h-[35rem] max-w-content flex-col justify-end px-5 pb-16 pt-28 sm:min-h-[40rem] sm:px-6 sm:pt-32 lg:min-h-[47.5rem] lg:px-8 lg:pb-24 lg:pt-36">
                <div className={`max-w-xl transition-all duration-500 ease-out ${textState}`}>
                    {content.eyebrow && (
                        <p className="text-caption uppercase text-white/70">{content.eyebrow}</p>
                    )}
                    <h1 className="mt-4 break-words text-h1 text-white" style={{ textWrap: 'balance' }}>
                        {heading}
                    </h1>
                    {content.description && (
                        <p className="mt-6 text-body-lg text-white/85">{content.description}</p>
                    )}
                    <div className="mt-10 flex flex-wrap gap-4">
                        {content.primary_cta_label && content.primary_cta_url && (
                            <Button asChild>
                                <Link href={localize(content.primary_cta_url)}>{content.primary_cta_label}</Link>
                            </Button>
                        )}
                        {content.secondary_cta_label && content.secondary_cta_url && (
                            <Button asChild variant="secondary" className="border-white/40 text-white hover:bg-white/10">
                                <Link href={localize(content.secondary_cta_url)}>{content.secondary_cta_label}</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
