import { SectionHeader } from '@/components/public/SectionHeader';
import { SectionRenderer } from '@/components/public/SectionRenderer';
import { SeoHead } from '@/components/public/SeoHead';
import { useLocale } from '@/hooks/use-locale';
import PublicLayout from '@/layouts/PublicLayout';
import { CmsPage, ResolvedSeo } from '@/types/cms';

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

            <section className="border-b border-border">
                <div className="mx-auto max-w-content px-5 py-16 sm:px-6 lg:px-8">
                    <SectionHeader as="h1" heading={page?.title ?? slug} />
                </div>
            </section>

            {sections.length > 0 ? (
                sections.map((section) => <SectionRenderer key={section.id} section={section} />)
            ) : (
                <p className="mx-auto max-w-content px-5 py-16 text-small text-muted-foreground sm:px-6 lg:px-8">
                    {t('No content published yet.')}
                </p>
            )}
        </PublicLayout>
    );
}
