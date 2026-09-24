import { CapabilityFeature, CapabilityFeatureItem } from '@/components/public/CapabilityFeature';
import { SectionHeader } from '@/components/public/SectionHeader';
import { SeoHead } from '@/components/public/SeoHead';
import { useLocale } from '@/hooks/use-locale';
import PublicLayout from '@/layouts/PublicLayout';
import { ResolvedSeo } from '@/types/cms';

export default function Index({ capabilities, seo }: { capabilities: CapabilityFeatureItem[]; seo: ResolvedSeo }) {
    const { t } = useLocale();
    return (
        <PublicLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border">
                <div className="mx-auto max-w-content px-5 py-16 sm:px-6 lg:px-8">
                    <SectionHeader
                        as="h1"
                        eyebrow={t('What We Do')}
                        heading={t('Capabilities')}
                        description={t('Manufacturing competency built on real process discipline and equipment.')}
                    />
                </div>
            </section>

            <div className="mx-auto max-w-content px-5 sm:px-6 lg:px-8">
                {capabilities.length === 0 ? (
                    <p className="py-16 text-small text-muted-foreground">{t('No capabilities published yet.')}</p>
                ) : (
                    <CapabilityFeature items={capabilities} />
                )}
            </div>
        </PublicLayout>
    );
}
