import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import type { PropsWithChildren } from 'react';

import { PublicFooter } from '@/components/public/PublicFooter';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { useScrollRevealBoundary } from '@/hooks/use-in-view';
import { startSmoothScroll } from '@/lib/smooth-scroll';

export default function PublicLayout({
    children,
    heroVariant = 'solid',
}: PropsWithChildren<{
    /**
     * 'transparent-*' pages open on a full-bleed hero (see
     * resources/js/components/public/Hero.tsx) that reserves its own top
     * space; 'solid' pages get top padding so content clears the logo tab.
     */
    heroVariant?: 'transparent-dark' | 'transparent-light' | 'solid';
}>) {
    const { props, url } = usePage();
    const { siteSettings } = props;
    const mainRef = useRef<HTMLElement>(null);
    const companyName = siteSettings?.company_name ?? 'PT. Kenco Manufactur Indonesia';

    useEffect(() => startSmoothScroll(), []);
    useScrollRevealBoundary(mainRef, url);

    return (
        // `public-site` opts the page into desktop proportional scaling (app.css).
        <div className="public-site flex min-h-screen flex-col bg-background text-foreground">
            <PublicNavbar companyName={companyName} />
            {/* Header is fixed (out of document flow) on every page, so
                solid-header pages need top padding equal to its height
                (h-20) to keep content clear of it. Transparent/hero pages
                skip this — Hero already reserves that space itself so the
                image can bleed under the header. */}
            <main ref={mainRef} className={`flex-1 ${heroVariant === 'solid' ? 'pt-20' : ''}`}>{children}</main>
            <PublicFooter />
        </div>
    );
}
