import { usePage } from '@inertiajs/react';
import { Fragment } from 'react';

import { ArticlePreview, ArticlePreviewItem } from '@/components/public/ArticlePreview';
import { CertificationItemData } from '@/components/public/CertificationItem';
import { CustomerLogo, CustomerLogos } from '@/components/public/CustomerLogos';
import { SectionHeader } from '@/components/public/SectionHeader';
import { SectionRenderer } from '@/components/public/SectionRenderer';
import { SeoHead } from '@/components/public/SeoHead';
import { useLocale } from '@/hooks/use-locale';
import PublicLayout from '@/layouts/PublicLayout';
import { PageSection, ResolvedSeo } from '@/types/cms';
import { Container, Section } from '@/components/public/Section';

type CustomerSegments = { stamping: CustomerLogo[]; engineering: CustomerLogo[] };

const CUSTOMER_ROWS: { key: keyof CustomerSegments; label: string }[] = [
    { key: 'stamping', label: 'Stamping Production' },
    { key: 'engineering', label: 'Engineering Production' },
];

/**
 * Customer logos, one drifting row per production line (Stamping on top);
 * homepage only, no links (user decisions 2026-09-29). Segment names stay
 * English in both languages, like the division names.
 */
function CustomersSection({ customers }: { customers: CustomerSegments }) {
    const { t } = useLocale();
    const rows = CUSTOMER_ROWS.filter((row) => customers[row.key].length > 0);
    if (rows.length === 0) return null;

    return (
        <Section className="border-t border-border">
            <SectionHeader eyebrow={t('Who We Serve')} heading={t('Customers Served')} />
            <div className="mt-10 space-y-10 lg:space-y-12">
                {rows.map((row) => (
                    <div key={row.key}>
                        <h3 className="text-small font-semibold uppercase tracking-wider text-slate-500">{row.label}</h3>
                        <div className="mt-4">
                            <CustomerLogos customers={customers[row.key]} />
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
}

function NewsSection({ articles }: { articles: ArticlePreviewItem[] }) {
    const { t } = useLocale();
    if (articles.length === 0) return null;

    return (
        <Container as="section" spacing="section">
            <SectionHeader eyebrow={t('Newsroom')} heading={t('Latest News')} cta={{ label: t('View All News'), href: '/news' }} />
            <div data-reveal-group className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3">
                {articles.map((article) => <ArticlePreview key={article.id} article={article} />)}
            </div>
        </Container>
    );
}

export default function Home({
    sections,
    seo,
    schema,
    latestArticles,
    certifications,
    customers,
    openJobCount,
}: {
    sections: PageSection[];
    seo: ResolvedSeo;
    schema?: Record<string, unknown>[];
    latestArticles: ArticlePreviewItem[];
    certifications: CertificationItemData[];
    customers: CustomerSegments;
    openJobCount: number;
}) {
    const { t } = useLocale();
    const { siteSettings } = usePage().props;

    if (sections.length === 0) {
        return (
            <PublicLayout>
                <SeoHead seo={seo} schema={schema} />
                <Container spacing="section" className="text-center">
                    <h1 className="text-h1 text-navy-900">{siteSettings?.company_name ?? 'PT. Kenco Manufactur Indonesia'}</h1>
                    <p className="mt-4 text-slate-500">
                        {t('Homepage content is being prepared. Check back soon.')}
                    </p>
                </Container>
            </PublicLayout>
        );
    }

    const heroVariant = sections[0]?.section_type === 'hero' ? 'transparent-dark' : 'solid';

    return (
        <PublicLayout heroVariant={heroVariant}>
            <SeoHead seo={seo} schema={schema} />

            {sections.map((section) => (
                <Fragment key={section.id}>
                    {section.section_type === 'news' ? (
                        <NewsSection articles={latestArticles} />
                    ) : (
                        <SectionRenderer section={section} certifications={certifications} openJobCount={openJobCount} />
                    )}

                    {section.section_type === 'quality' && <CustomersSection customers={customers} />}
                </Fragment>
            ))}
        </PublicLayout>
    );
}
