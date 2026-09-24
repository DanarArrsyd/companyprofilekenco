import { ImagePlaceholder } from '@/components/public/ImagePlaceholder';
import { useLocale } from '@/hooks/use-locale';

export interface IndustryGridItem {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    image: string | null;
}

/**
 * Flat equal-weight grid — the one place a grid is honest to the content
 * (industries are a genuine peer set with nothing more to say per item).
 * Image + caption only: no border, no surface box.
 */
export function IndustryGrid({ items, showDescription = false }: { items: IndustryGridItem[]; showDescription?: boolean }) {
    const { localize } = useLocale();
    if (items.length === 0) return null;

    return (
        <div data-reveal-group className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {items.map((industry) => (
                <a
                    key={industry.id}
                    id={industry.slug}
                    href={localize(`/company#${industry.slug}`)}
                    className="group block"
                >
                    <div className="aspect-square w-full bg-muted">
                        {industry.image ? (
                            <img
                                src={`/storage/${industry.image}`}
                                alt={industry.name}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                            />
                        ) : (
                            <ImagePlaceholder />
                        )}
                    </div>
                    <p className="mt-3 text-center text-small font-medium text-foreground">{industry.name}</p>
                    {showDescription && industry.description && (
                        <p className="mt-1 text-center text-caption text-muted-foreground">{industry.description}</p>
                    )}
                </a>
            ))}
        </div>
    );
}
