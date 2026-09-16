import { FacilityFeature, FacilityFeatureItem } from '@/components/public/FacilityFeature';
import { SectionHeader } from '@/components/public/SectionHeader';
import { SeoHead } from '@/components/public/SeoHead';
import { useInView } from '@/hooks/use-in-view';
import PublicLayout from '@/layouts/PublicLayout';
import { ResolvedSeo } from '@/types/cms';

function FacilityRow({ facility }: { facility: FacilityFeatureItem }) {
    const { ref, inView } = useInView<HTMLDivElement>();

    return (
        <div ref={ref} className={`transition-all duration-500 ease-out ${inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <FacilityFeature facility={facility} maxMachines={12} showLink={false} />
        </div>
    );
}

export default function Index({ facilities, seo }: { facilities: FacilityFeatureItem[]; seo: ResolvedSeo }) {
    return (
        <PublicLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border">
                <div className="mx-auto max-w-content px-5 py-16 sm:px-6 lg:px-8">
                    <SectionHeader
                        as="h1"
                        eyebrow="Where We Manufacture"
                        heading="Facilities"
                        description="Our production sites and the equipment that runs on them."
                    />
                </div>
            </section>

            {facilities.length === 0 ? (
                <p className="mx-auto max-w-content px-5 py-16 text-small text-muted-foreground sm:px-6 lg:px-8">
                    No facilities published yet.
                </p>
            ) : (
                <div className="mx-auto max-w-content space-y-16 px-5 py-16 sm:px-6 lg:px-8">
                    {facilities.map((facility) => <FacilityRow key={facility.id} facility={facility} />)}
                </div>
            )}
        </PublicLayout>
    );
}
