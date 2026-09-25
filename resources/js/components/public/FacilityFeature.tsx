import { Link } from '@inertiajs/react';

import { ImagePlaceholder } from '@/components/public/ImagePlaceholder';
import { useLocale } from '@/hooks/use-locale';

export interface FacilityFeatureMachine {
    id: number;
    name: string;
    brand?: string | null;
    model?: string | null;
    capacity?: string | null;
    quantity?: number | null;
}

export interface FacilityFeatureItem {
    id: number;
    name: string;
    slug: string;
    location?: string | null;
    description?: string | null;
    image?: string | null;
    category?: { id: number; name: string } | null;
    machines?: FacilityFeatureMachine[];
}

/**
 * The single strongest visual proof point on the site: one large facility
 * photo with a solid spec plate surfacing real machine data. Renders only
 * fields that actually exist — no invented floor area, capacity, or
 * tolerance figures.
 */
export function FacilityFeature({
    facility,
    maxMachines = 4,
    showLink = true,
}: {
    facility: FacilityFeatureItem | null;
    maxMachines?: number;
    showLink?: boolean;
}) {
    const { localize, t } = useLocale();
    if (!facility) return null;

    const machines = (facility.machines ?? []).slice(0, maxMachines);

    return (
        <div className="relative">
            <div data-reveal="image" className="aspect-[16/9] w-full bg-muted lg:aspect-[21/9]">
                {facility.image ? (
                    <img
                        src={`/storage/${facility.image}`}
                        alt={facility.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <ImagePlaceholder />
                )}
            </div>

            <div data-reveal="up" className="bg-navy-900 p-6 text-white sm:p-8 lg:absolute lg:bottom-6 lg:left-6 lg:max-w-xl lg:p-8">
                {facility.category && <p className="text-caption uppercase text-white/50">{facility.category.name}</p>}
                <p className="mt-1 text-h3 text-white">{facility.name}</p>
                {facility.location && <p className="mt-1 text-small text-white/70">{facility.location}</p>}
                {facility.description && <p className="mt-3 max-w-md text-small text-white/70">{facility.description}</p>}

                {machines.length > 0 && (
                    <dl className="mt-6 divide-y divide-white/15 border-t border-white/15">
                        {machines.map((machine) => (
                            <div key={machine.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5">
                                <dt className="text-small text-white/80">
                                    {machine.name}
                                    {(machine.brand || machine.model) && (
                                        <span className="text-white/50"> — {[machine.brand, machine.model].filter(Boolean).join(' ')}</span>
                                    )}
                                </dt>
                                <dd className="tabular-nums shrink-0 text-small text-white">
                                    {[machine.capacity, machine.quantity ? `×${machine.quantity}` : null].filter(Boolean).join(' · ') || '—'}
                                </dd>
                            </div>
                        ))}
                    </dl>
                )}

                {showLink && (
                    <Link href={localize('/company#facilities')} className="mt-6 inline-block text-small font-medium text-white hover:text-white/80">
                        {t('View All Facilities')} &rarr;
                    </Link>
                )}
            </div>
        </div>
    );
}
