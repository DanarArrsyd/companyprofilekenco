import { ImagePlaceholder } from '@/components/public/ImagePlaceholder';
import { SectionHeader } from '@/components/public/SectionHeader';
import { SeoHead } from '@/components/public/SeoHead';
import { revealClass, useInView } from '@/hooks/use-in-view';
import PublicLayout from '@/layouts/PublicLayout';
import { ResolvedSeo } from '@/types/cms';

interface QualityRow {
    id: number; title: string; summary: string | null; content: string | null; image: string | null;
}

function QualityBlock({ item, reverse }: { item: QualityRow; reverse: boolean }) {
    const { ref, inView } = useInView<HTMLDivElement>();

    return (
        <div
            ref={ref}
            className={`grid grid-cols-1 items-center gap-8 py-12 lg:grid-cols-2 lg:gap-16 ${revealClass(inView)}`}
        >
            <div className={`aspect-[4/3] w-full bg-muted ${reverse ? 'lg:order-last' : ''}`}>
                {item.image ? (
                    <img src={`/storage/${item.image}`} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                    <ImagePlaceholder />
                )}
            </div>
            <div>
                <h2 className="text-h3 text-navy-900">{item.title}</h2>
                {item.summary && <p className="mt-3 text-body-lg text-slate-700">{item.summary}</p>}
                {item.content && <p className="mt-4 text-body text-slate-700">{item.content}</p>}
            </div>
        </div>
    );
}

export default function Index({ items, seo }: { items: QualityRow[]; seo: ResolvedSeo }) {
    return (
        <PublicLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border">
                <div className="mx-auto max-w-content px-5 py-16 sm:px-6 lg:px-8">
                    <SectionHeader
                        as="h1"
                        eyebrow="Quality"
                        heading="Built on a formal quality system"
                        description="Every production run is inspected against documented process controls."
                    />
                </div>
            </section>

            <div className="mx-auto max-w-content divide-y divide-border px-5 sm:px-6 lg:px-8">
                {items.length === 0 ? (
                    <p className="py-16 text-small text-muted-foreground">Quality content coming soon.</p>
                ) : (
                    items.map((item, index) => <QualityBlock key={item.id} item={item} reverse={index % 2 === 1} />)
                )}
            </div>
        </PublicLayout>
    );
}
