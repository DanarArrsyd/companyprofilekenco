import { Link, usePage } from '@inertiajs/react';

import { useLocale } from '@/hooks/use-locale';
import { Container } from '@/components/public/Section';

const NAV_GROUPS: { heading: string; links: { label: string; href: string }[] }[] = [
    {
        heading: 'Company',
        links: [
            { label: 'About', href: '/company#about' },
            { label: 'Vision & Mission', href: '/company#vision-mission' },
            { label: 'Facilities', href: '/company#facilities' },
            { label: 'Industries', href: '/company#industries' },
        ],
    },
    {
        heading: 'What We Do',
        links: [
            { label: 'Capabilities', href: '/capabilities' },
            { label: 'Products', href: '/products' },
        ],
    },
    {
        heading: 'Resources',
        links: [
            { label: 'Quality & Certifications', href: '/quality' },
            { label: 'News', href: '/news' },
            { label: 'Careers', href: '/careers' },
        ],
    },
];

export function PublicFooter() {
    const { localize, t } = useLocale();
    const { siteSettings } = usePage().props;
    const companyName = siteSettings?.company_name ?? 'PT. Kenco Manufactur Indonesia';
    const social = siteSettings?.social;
    const hasSocial = Boolean(social?.linkedin || social?.youtube || social?.instagram);

    return (
        <footer className="border-t border-border bg-navy-900 text-white">
            <Container spacing="intro">
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
                    <div>
                        <p className="text-h4 text-white">{companyName}</p>
                        {siteSettings?.tagline && (
                            <p className="mt-3 max-w-xs text-small text-slate-500">{siteSettings.tagline}</p>
                        )}

                        {hasSocial && (
                            <div className="mt-6 flex gap-4 text-small">
                                {social?.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white">LinkedIn</a>}
                                {social?.youtube && <a href={social.youtube} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white">YouTube</a>}
                                {social?.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white">Instagram</a>}
                            </div>
                        )}
                    </div>

                    {NAV_GROUPS.map((group) => (
                        <div key={group.heading}>
                            <p className="text-caption uppercase text-slate-500">{t(group.heading)}</p>
                            <ul className="mt-4 space-y-2.5 text-small">
                                {group.links.map((link) => (
                                    <li key={link.href}>
                                        <Link href={localize(link.href)} className="text-white/75 hover:text-white">
                                            {t(link.label)}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    <div>
                        <p className="text-caption uppercase text-slate-500">{t('Contact')}</p>
                        <ul className="mt-4 space-y-2.5 text-small text-white/75">
                            <li><Link href={localize('/contact')} className="hover:text-white">{t('Get in touch')}</Link></li>
                            {siteSettings?.phone && <li><a href={`tel:${siteSettings.phone}`} className="hover:text-white">{siteSettings.phone}</a></li>}
                            {siteSettings?.email && <li><a href={`mailto:${siteSettings.email}`} className="hover:text-white">{siteSettings.email}</a></li>}
                            {siteSettings?.address && <li className="text-slate-500">{siteSettings.address}</li>}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 flex flex-col gap-3 border-t border-navy-700 pt-6 text-caption text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>&copy; {new Date().getFullYear()} {companyName}. {t('All rights reserved.')}</p>
                </div>
            </Container>
        </footer>
    );
}
