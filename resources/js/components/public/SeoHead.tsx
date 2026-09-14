import { Head } from '@inertiajs/react';

import { ResolvedSeo } from '@/types/cms';

export function SeoHead({ seo }: { seo: ResolvedSeo }) {
    const robots = [
        seo.robots_index ? 'index' : 'noindex',
        seo.robots_follow ? 'follow' : 'nofollow',
    ].join(', ');

    return (
        <Head title={seo.title}>
            {seo.description && <meta name="description" content={seo.description} />}
            <meta name="robots" content={robots} />
            {seo.canonical_url && <link rel="canonical" href={seo.canonical_url} />}
            {seo.og_title && <meta property="og:title" content={seo.og_title} />}
            {seo.og_description && <meta property="og:description" content={seo.og_description} />}
            {seo.og_image && <meta property="og:image" content={seo.og_image} />}
        </Head>
    );
}
