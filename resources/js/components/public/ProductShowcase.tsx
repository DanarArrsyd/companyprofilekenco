import { Link } from '@inertiajs/react';

import { ImagePlaceholder } from '@/components/public/ImagePlaceholder';
import { RevealGroup } from '@/components/public/ScrollReveal';
import { useLocale } from '@/hooks/use-locale';

export interface ProductShowcaseItem {
    id: number;
    name: string;
    slug: string;
    short_description?: string | null;
    featured_image?: string | null;
    is_featured?: boolean;
    category?: { id: number; name: string } | null;
}

function Unit({ item, large = false }: { item: ProductShowcaseItem; large?: boolean }) {
    const { localize } = useLocale();
    return (
        <Link href={localize(`/products/${item.slug}`)} className="group block shrink-0 w-[78vw] snap-start sm:w-auto">
            <div className={`relative w-full bg-muted ${large ? 'aspect-[4/3]' : 'aspect-square'}`}>
                {item.featured_image ? (
                    <img
                        src={`/storage/${item.featured_image}`}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                    />
                ) : (
                    <ImagePlaceholder />
                )}
                {item.is_featured && (
                    <span className="absolute left-0 top-0 bg-navy-900 px-2.5 py-1 text-caption uppercase text-white">Featured</span>
                )}
            </div>
            {item.category && <p className="mt-4 text-caption uppercase text-muted-foreground">{item.category.name}</p>}
            <p className={`font-medium text-foreground ${large ? 'text-h4' : 'text-body'} ${item.category ? 'mt-1' : 'mt-4'}`}>{item.name}</p>
            {item.short_description && <p className="mt-1 text-small text-muted-foreground">{item.short_description}</p>}
        </Link>
    );
}

/**
 * Grid density adapts to how many products there actually are, so a single
 * featured product never sits stranded as one small tile in an otherwise
 * empty 3-column row.
 */
export function ProductShowcase({ items }: { items: ProductShowcaseItem[] }) {
    if (items.length === 0) return null;

    if (items.length === 1) {
        return (
            <RevealGroup className="max-w-md">
                <Unit item={items[0]} large />
            </RevealGroup>
        );
    }

    const gridCols = items.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3';

    return (
        <RevealGroup className={`-mx-5 flex snap-x snap-mandatory gap-8 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:overflow-visible sm:px-0 ${gridCols}`}>
            {items.map((item) => <Unit key={item.id} item={item} />)}
        </RevealGroup>
    );
}
