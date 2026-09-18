import { SectionHeader } from '@/components/public/SectionHeader';
import { SectionRenderer } from '@/components/public/SectionRenderer';
import { SeoHead } from '@/components/public/SeoHead';
import PublicLayout from '@/layouts/PublicLayout';
import { CmsPage, ResolvedSeo } from '@/types/cms';

/**
 * Static eyebrow/H1 copy for the pages CLAUDE.md requires under /company —
 * matches the benchmark pattern used by Products/Facilities/Certifications
 * (a fixed banner per page type, not CMS-sourced). Any other standard page
 * falls back to its own title with no eyebrow.
 */
const HEADER_COPY: Record<string, { eyebrow: string; heading: string }> = {
    company: { eyebrow: 'Our Company', heading: 'Company' },
    'company/vision-mission': { eyebrow: 'Our Direction', heading: 'Vision & Mission' },
};

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
    const sections = page?.sections ?? [];
    const header = HEADER_COPY[slug];

    return (
        <PublicLayout>
            <SeoHead seo={seo} />

            {preview && (
                <div className="bg-warning/10 px-5 py-2 text-center text-sm font-medium text-warning">
                    Draft preview — this page is not publicly visible.
                </div>
            )}

            <section className="border-b border-border">
                <div className="mx-auto max-w-content px-5 py-16 sm:px-6 lg:px-8">
                    <SectionHeader as="h1" eyebrow={header?.eyebrow} heading={header?.heading ?? page?.title ?? slug} />
                </div>
            </section>

            {sections.length > 0 ? (
                sections.map((section) => <SectionRenderer key={section.id} section={section} />)
            ) : (
                <p className="mx-auto max-w-content px-5 py-16 text-small text-muted-foreground sm:px-6 lg:px-8">
                    No content published yet.
                </p>
            )}
        </PublicLayout>
    );
}
