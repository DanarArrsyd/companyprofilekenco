import { usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

import { PublicFooter } from '@/components/public/PublicFooter';
import { PublicNavbar } from '@/components/public/PublicNavbar';

export default function PublicLayout({
    children,
    heroVariant = 'solid',
}: PropsWithChildren<{
    /** 'transparent' floats the header over a full-bleed hero image (see resources/js/components/public/Hero.tsx); 'solid' is every other page. */
    heroVariant?: 'transparent' | 'solid';
}>) {
    const { siteSettings } = usePage().props;
    const companyName = siteSettings?.company_name ?? 'PT. Kenco Manufactur Indonesia';

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <PublicNavbar companyName={companyName} logo={siteSettings?.logo} variant={heroVariant} />
            <main className="flex-1">{children}</main>
            <PublicFooter />
        </div>
    );
}
