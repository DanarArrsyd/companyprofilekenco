import { IndustryGrid, IndustryGridItem } from '@/components/public/IndustryGrid';
import { SectionHeader } from '@/components/public/SectionHeader';
import { SeoHead } from '@/components/public/SeoHead';
import PublicLayout from '@/layouts/PublicLayout';
import { ResolvedSeo } from '@/types/cms';

export default function Index({ industries, seo }: { industries: IndustryGridItem[]; seo: ResolvedSeo }) {
    return (
        <PublicLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border">
                <div className="mx-auto max-w-content px-5 py-16 sm:px-6 lg:px-8">
                    <SectionHeader as="h1" eyebrow="Who We Serve" heading="Industries" description="Sectors we manufacture for." />
                </div>
            </section>

            <div className="mx-auto max-w-content px-5 py-12 sm:px-6 lg:px-8">
                {industries.length === 0 ? (
                    <p className="text-small text-muted-foreground">No industries published yet.</p>
                ) : (
                    <IndustryGrid items={industries} showDescription />
                )}
            </div>
        </PublicLayout>
    );
}
