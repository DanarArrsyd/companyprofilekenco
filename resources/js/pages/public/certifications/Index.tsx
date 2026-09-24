import { CertificationItem, CertificationItemData } from '@/components/public/CertificationItem';
import { SectionHeader } from '@/components/public/SectionHeader';
import { SeoHead } from '@/components/public/SeoHead';
import { useLocale } from '@/hooks/use-locale';
import PublicLayout from '@/layouts/PublicLayout';
import { ResolvedSeo } from '@/types/cms';

export default function Index({ certifications, seo }: { certifications: CertificationItemData[]; seo: ResolvedSeo }) {
    const { t } = useLocale();
    const active = certifications.filter((c) => !c.is_expired);
    const expired = certifications.filter((c) => c.is_expired);
    const showGrouped = active.length > 0 && expired.length > 0;

    return (
        <PublicLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border">
                <div className="mx-auto max-w-content px-5 py-16 sm:px-6 lg:px-8">
                    <SectionHeader
                        as="h1"
                        eyebrow={t('Compliance')}
                        heading={t('Certifications')}
                        description={t('Our quality certifications and accreditations, kept current.')}
                    />
                </div>
            </section>

            <div className="mx-auto max-w-content px-5 py-12 sm:px-6 lg:px-8">
                {certifications.length === 0 ? (
                    <p className="text-small text-muted-foreground">{t('No certifications published yet.')}</p>
                ) : showGrouped ? (
                    <div className="space-y-12">
                        <div>
                            <h2 className="text-caption uppercase text-muted-foreground">{t('Active')}</h2>
                            <div className="mt-2">
                                <CertificationItem items={active} variant="detailed" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-caption uppercase text-muted-foreground">{t('Expired')}</h2>
                            <div className="mt-2">
                                <CertificationItem items={expired} variant="detailed" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <CertificationItem items={certifications} variant="detailed" />
                )}
            </div>
        </PublicLayout>
    );
}
