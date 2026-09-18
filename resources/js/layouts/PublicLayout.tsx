import { usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

import { PublicFooter } from '@/components/public/PublicFooter';
import { PublicNavbar } from '@/components/public/PublicNavbar';

export default function PublicLayout({
    children,
    heroVariant = 'solid',
}: PropsWithChildren<{
    /**
     * 'transparent-dark' / 'transparent-light' float the header over a
     * full-bleed hero image (see resources/js/components/public/Hero.tsx),
     * in white or navy text depending on how light the hero image/overlay
     * is. 'solid' is every page without a hero.
     */
    heroVariant?: 'transparent-dark' | 'transparent-light' | 'solid';
}>) {
    const { siteSettings } = usePage().props;
    const companyName = siteSettings?.company_name ?? 'PT. Kenco Manufactur Indonesia';

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <PublicNavbar companyName={companyName} logo={siteSettings?.logo} variant={heroVariant} />
            {/* Header is fixed (out of document flow) on every page, so
                solid-header pages need top padding equal to its height
                (h-20) to keep content clear of it. Transparent/hero pages
                skip this — Hero already reserves that space itself so the
                image can bleed under the header. */}
            <main className={`flex-1 ${heroVariant === 'solid' ? 'pt-20' : ''}`}>{children}</main>
            <PublicFooter />
        </div>
    );
}
