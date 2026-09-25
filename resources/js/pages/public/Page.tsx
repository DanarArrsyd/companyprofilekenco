import { SectionHeader } from '@/components/public/SectionHeader';
import { SectionRenderer } from '@/components/public/SectionRenderer';
import { SeoHead } from '@/components/public/SeoHead';
import { useLocale } from '@/hooks/use-locale';
import PublicLayout from '@/layouts/PublicLayout';
import { CmsPage, ResolvedSeo } from '@/types/cms';
import { Container, Section } from '@/components/public/Section';

/**
 * Generic renderer for any admin-created standard Page under company/* that
 * isn't the merged /company page itself (see public/company/Index.tsx,
 * which owns the 'company' and 'company/vision-mission' slugs).
 */
export default function Page({
    slug,
    page,
    seo,
    preview,
}: {
    slug: string;
    page: CmsPage | null;
    seo: ResolvedSeo;
    preview: boolean;
}) {
    const { t } = useLocale();
    const sections = page?.sections ?? [];

    return (
        <PublicLayout>
            <SeoHead seo={seo} />

            {preview && (
                <div className="bg-warning/10 px-5 py-2 text-center text-sm font-medium text-warning">
                    {t('Draft preview — this page is not publicly visible.')}
                </div>
            )}

            <Section className="border-b border-border" spacing="intro">
                <SectionHeader as="h1" heading={page?.title ?? slug} />
            </Section>

            {sections.length > 0 ? (
                sections.map((section) => <SectionRenderer key={section.id} section={section} />)
            ) : (
                <Container as="p" spacing="content" className="text-small text-muted-foreground">
                    {t('No content published yet.')}
                </Container>
            )}
        </PublicLayout>
    );
}
