import { Link } from '@inertiajs/react';

import { ImagePlaceholder } from '@/components/public/ImagePlaceholder';
import { revealClass, useInView } from '@/hooks/use-in-view';
import { useLocale } from '@/hooks/use-locale';

export interface CapabilityFeatureItem {
    id: number;
    name: string;
    slug: string;
    summary?: string | null;
    featured_image?: string | null;
}

function Row({ item, reverse }: { item: CapabilityFeatureItem; reverse: boolean }) {
    const { localize } = useLocale();
    const { ref, inView } = useInView<HTMLDivElement>();

    return (
        <div
            ref={ref}
            className={`${revealClass(inView)} grid grid-cols-1 items-center gap-8 py-10 lg:grid-cols-2 lg:gap-16`}
        >
            <div className={`aspect-[4/3] w-full bg-muted ${reverse ? 'lg:order-last' : ''}`}>
                {item.featured_image ? (
                    <img
                        src={`/storage/${item.featured_image}`}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <ImagePlaceholder />
                )}
            </div>

            <div>
                <h3 className="text-h3 text-navy-900">{item.name}</h3>
                {item.summary && <p className="mt-3 text-body text-slate-700">{item.summary}</p>}
                <Link href={localize(`/capabilities/${item.slug}`)} className="mt-5 inline-block text-sm font-medium text-navy-700 hover:text-navy-900">
                    View Capability &rarr;
                </Link>
            </div>
        </div>
    );
}

export function CapabilityFeature({ items }: { items: CapabilityFeatureItem[] }) {
    if (items.length === 0) return null;

    return (
        <div className="divide-y divide-border">
            {items.map((item, index) => (
                <Row key={item.id} item={item} reverse={index % 2 === 1} />
            ))}
        </div>
    );
}
