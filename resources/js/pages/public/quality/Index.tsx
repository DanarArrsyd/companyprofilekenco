import { ImagePlaceholder } from '@/components/public/ImagePlaceholder';
import { SectionHeader } from '@/components/public/SectionHeader';
import { SeoHead } from '@/components/public/SeoHead';
import { revealClass, useInView } from '@/hooks/use-in-view';
import { useLocale } from '@/hooks/use-locale';
import PublicLayout from '@/layouts/PublicLayout';
import { ResolvedSeo } from '@/types/cms';
import { Container, Section } from '@/components/public/Section';

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
    const { t } = useLocale();
    return (
        <PublicLayout>
            <SeoHead seo={seo} />

            <Section className="border-b border-border" spacing="intro">
                <SectionHeader
                    as="h1"
                    eyebrow={t('Quality')}
                    heading={t('Built on a formal quality system')}
                    description={t('Every production run is inspected against documented process controls.')}
                />
            </Section>

            <Container className="divide-y divide-border">
                {items.length === 0 ? (
                    <p className="py-16 text-small text-muted-foreground">{t('Quality content coming soon.')}</p>
                ) : (
                    items.map((item, index) => <QualityBlock key={item.id} item={item} reverse={index % 2 === 1} />)
                )}
            </Container>
        </PublicLayout>
    );
}
