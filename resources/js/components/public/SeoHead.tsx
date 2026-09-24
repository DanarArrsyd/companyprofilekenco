import { Head, usePage } from '@inertiajs/react';

import { jsonLdScripts } from '@/components/public/JsonLd';
import { useLocale } from '@/hooks/use-locale';
import { DEFAULT_LOCALE } from '@/lib/locale';
import { ResolvedSeo } from '@/types/cms';

export function SeoHead({
    seo,
    schema,
}: {
    seo: ResolvedSeo;
    /** Page-specific JSON-LD (Organization/WebSite/BreadcrumbList/Article/JobPosting/Service). */
    schema?: Record<string, unknown> | Array<Record<string, unknown> | null | undefined> | null;
}) {
    const { siteSettings } = usePage().props;
    const siteName = siteSettings?.company_name ?? undefined;
    const { locale, alternates } = useLocale();

    const robots = [
        seo.robots_index ? 'index' : 'noindex',
        seo.robots_follow ? 'follow' : 'nofollow',
    ].join(', ');

    return (
        <Head title={seo.title}>
            {seo.description && <meta name="description" content={seo.description} />}
            <meta name="robots" content={robots} />
            {seo.canonical_url && <link rel="canonical" href={seo.canonical_url} />}

            {/* Every language version, plus x-default → the default locale. */}
            {Object.entries(alternates).map(([hreflang, href]) => (
                <link key={hreflang} rel="alternate" hrefLang={hreflang} href={href} />
            ))}
            {alternates[DEFAULT_LOCALE] && <link rel="alternate" hrefLang="x-default" href={alternates[DEFAULT_LOCALE]} />}
            <meta property="og:locale" content={locale === 'id' ? 'id_ID' : 'en_US'} />

            {seo.og_title && <meta property="og:title" content={seo.og_title} />}
            {seo.og_description && <meta property="og:description" content={seo.og_description} />}
            {seo.canonical_url && <meta property="og:url" content={seo.canonical_url} />}
            <meta property="og:type" content={seo.og_type ?? 'website'} />
            {seo.og_image && <meta property="og:image" content={seo.og_image} />}
            {siteName && <meta property="og:site_name" content={siteName} />}

            <meta name="twitter:card" content={seo.twitter_card ?? (seo.og_image ? 'summary_large_image' : 'summary')} />
            {(seo.twitter_title ?? seo.og_title) && <meta name="twitter:title" content={seo.twitter_title ?? seo.og_title ?? undefined} />}
            {(seo.twitter_description ?? seo.og_description) && <meta name="twitter:description" content={seo.twitter_description ?? seo.og_description ?? undefined} />}
            {(seo.twitter_image ?? seo.og_image) && <meta name="twitter:image" content={seo.twitter_image ?? seo.og_image ?? undefined} />}
            {seo.twitter_site && <meta name="twitter:site" content={seo.twitter_site} />}

            {schema && jsonLdScripts(schema)}
        </Head>
    );
}
