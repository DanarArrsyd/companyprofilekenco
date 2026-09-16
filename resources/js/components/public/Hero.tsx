import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import { ImagePlaceholder } from '@/components/public/ImagePlaceholder';
import { Button } from '@/components/ui/button';

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
        <section className="border-b border-border bg-surface">
            <div className="mx-auto grid max-w-content grid-cols-1 lg:grid-cols-[3fr_2fr]">
                <div className="flex flex-col justify-center px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
                    <div className={`max-w-xl transition-all duration-500 ease-out ${textState}`}>
                        {content.eyebrow && (
                            <p className="text-caption uppercase text-muted-foreground">{content.eyebrow}</p>
                        )}
                        <h1 className="mt-4 text-h1 text-navy-900" style={{ textWrap: 'balance' }}>
                            {heading}
                        </h1>
                        {content.description && (
                            <p className="mt-6 text-body-lg text-slate-700">{content.description}</p>
                        )}
                        <div className="mt-10 flex flex-wrap gap-4">
                            {content.primary_cta_label && content.primary_cta_url && (
                                <Button asChild>
                                    <Link href={content.primary_cta_url}>{content.primary_cta_label}</Link>
                                </Button>
                            )}
                            {content.secondary_cta_label && content.secondary_cta_url && (
                                <Button asChild variant="secondary">
                                    <Link href={content.secondary_cta_url}>{content.secondary_cta_label}</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="order-first aspect-[4/3] w-full bg-muted lg:order-last lg:aspect-auto">
                    {content.image ? (
                        <img
                            src={`/storage/${content.image}`}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="eager"
                            // @ts-expect-error fetchpriority is valid HTML but not yet in React's DOM typings
                            fetchpriority="high"
                        />
                    ) : (
                        <ImagePlaceholder className="min-h-[280px]" />
                    )}
                </div>
            </div>
        </section>
    );
}
