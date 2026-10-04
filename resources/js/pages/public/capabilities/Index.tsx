import { CapabilityCardItem, CapabilityShowcase } from '@/components/public/CapabilityShowcase';
import { SeoHead } from '@/components/public/SeoHead';
import { useLocale } from '@/hooks/use-locale';
import PublicLayout from '@/layouts/PublicLayout';
import { ResolvedSeo } from '@/types/cms';

export default function Index({ capabilities, seo }: { capabilities: CapabilityCardItem[]; seo: ResolvedSeo }) {
    const { t } = useLocale();

    return (
        <PublicLayout>
            <SeoHead seo={seo} />

            <CapabilityShowcase
                as="h1"
                items={capabilities}
                heading={t('Manufacturing Capabilities')}
                description={t('Integrated manufacturing capabilities supporting production, engineering, fabrication, and assembly processes with a strong focus on quality, precision, and efficiency.')}
            />
        </PublicLayout>
    );
}
