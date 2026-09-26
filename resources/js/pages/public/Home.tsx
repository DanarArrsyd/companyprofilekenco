import { usePage } from '@inertiajs/react';
import { Fragment } from 'react';

import { ArticlePreview, ArticlePreviewItem } from '@/components/public/ArticlePreview';
import { CertificationItemData } from '@/components/public/CertificationItem';
import { IndustryGrid, IndustryGridItem } from '@/components/public/IndustryGrid';
import { SectionHeader } from '@/components/public/SectionHeader';
import { SectionRenderer } from '@/components/public/SectionRenderer';
import { SeoHead } from '@/components/public/SeoHead';
import { useLocale } from '@/hooks/use-locale';
import PublicLayout from '@/layouts/PublicLayout';
import { PageSection, ResolvedSeo } from '@/types/cms';
import { Container, Section } from '@/components/public/Section';

function IndustriesSection({ items }: { items: IndustryGridItem[] }) {
    const { t } = useLocale();
    if (items.length === 0) return null;

    return (
        <Section className="border-t border-border">
            <SectionHeader eyebrow={t('Who We Serve')} heading={t('Industries Served')} cta={{ label: t('View All Industries'), href: '/company#industries' }} />
            <div className="mt-10">
                <IndustryGrid items={items} />
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
    industries,
    openJobCount,
}: {
    sections: PageSection[];
    seo: ResolvedSeo;
    schema?: Record<string, unknown>[];
    latestArticles: ArticlePreviewItem[];
    certifications: CertificationItemData[];
    industries: IndustryGridItem[];
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

                    {section.section_type === 'quality' && <IndustriesSection items={industries} />}
                </Fragment>
            ))}
        </PublicLayout>
    );
}
