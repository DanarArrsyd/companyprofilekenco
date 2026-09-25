import { CapabilityFeature, CapabilityFeatureItem } from '@/components/public/CapabilityFeature';
import { SectionHeader } from '@/components/public/SectionHeader';
import { SeoHead } from '@/components/public/SeoHead';
import { useLocale } from '@/hooks/use-locale';
import PublicLayout from '@/layouts/PublicLayout';
import { ResolvedSeo } from '@/types/cms';
import { Container, Section } from '@/components/public/Section';

export default function Index({ capabilities, seo }: { capabilities: CapabilityFeatureItem[]; seo: ResolvedSeo }) {
    const { t } = useLocale();
    return (
        <PublicLayout>
            <SeoHead seo={seo} />

            <Section className="border-b border-border" spacing="intro">
                <SectionHeader
                    as="h1"
                    eyebrow={t('What We Do')}
                    heading={t('Capabilities')}
                    description={t('Manufacturing competency built on real process discipline and equipment.')}
                />
            </Section>

            <Container>
                {capabilities.length === 0 ? (
                    <p className="py-16 text-small text-muted-foreground">{t('No capabilities published yet.')}</p>
                ) : (
                    <CapabilityFeature items={capabilities} />
                )}
            </Container>
        </PublicLayout>
    );
}
