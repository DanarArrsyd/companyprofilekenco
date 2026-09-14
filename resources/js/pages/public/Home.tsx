import { NewsPreview, SectionRenderer } from '@/components/public/SectionRenderer';
import { SeoHead } from '@/components/public/SeoHead';
import PublicLayout from '@/layouts/PublicLayout';
import { PageSection, ResolvedSeo } from '@/types/cms';

interface LatestArticle {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
}

export default function Home({
    sections,
    seo,
    latestArticles,
}: {
    sections: PageSection[];
    seo: ResolvedSeo;
    latestArticles: LatestArticle[];
}) {
    if (sections.length === 0) {
        return (
            <PublicLayout>
                <SeoHead seo={seo} />
                <div className="mx-auto max-w-content px-5 py-24 text-center sm:px-6 lg:px-8">
                    <h1 className="text-h1 text-navy-900">Kenco Manufacturing</h1>
                    <p className="mt-4 text-slate-500">
                        Homepage content is being prepared. Check back soon.
                    </p>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <SeoHead seo={seo} />

            {sections.map((section) =>
                section.section_type === 'news' ? (
                    <NewsPreview key={section.id} articles={latestArticles} />
                ) : (
                    <SectionRenderer key={section.id} section={section} />
                ),
            )}
        </PublicLayout>
    );
}
