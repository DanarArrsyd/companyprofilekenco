import { SectionRenderer } from '@/components/public/SectionRenderer';
import { SeoHead } from '@/components/public/SeoHead';
import PublicLayout from '@/layouts/PublicLayout';
import { CmsPage, ResolvedSeo } from '@/types/cms';

export default function Page({
    page,
    seo,
    preview,
}: {
    page: CmsPage;
    seo: ResolvedSeo;
    preview: boolean;
}) {
    const sections = page.sections ?? [];

    return (
        <PublicLayout>
            <SeoHead seo={seo} />

            {preview && (
                <div className="bg-warning/10 px-5 py-2 text-center text-sm font-medium text-warning">
                    Draft preview — this page is not publicly visible.
                </div>
            )}

            {sections.length === 0 ? (
                <div className="mx-auto max-w-content px-5 py-24 text-center sm:px-6 lg:px-8">
                    <h1 className="text-h1 text-navy-900">{page.title}</h1>
                    <p className="mt-4 text-slate-500">This page has no content yet.</p>
                </div>
            ) : (
                sections.map((section) => <SectionRenderer key={section.id} section={section} />)
            )}
        </PublicLayout>
    );
}
