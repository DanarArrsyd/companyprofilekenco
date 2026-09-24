import { useState } from 'react';

import { Breadcrumb, BreadcrumbItem } from '@/components/public/Breadcrumb';
import { ImagePlaceholder } from '@/components/public/ImagePlaceholder';
import { SeoHead } from '@/components/public/SeoHead';
import { useLocale } from '@/hooks/use-locale';
import PublicLayout from '@/layouts/PublicLayout';
import { ResolvedSeo } from '@/types/cms';

interface ProductImage {
    id: number;
    path: string;
    alt_text: string | null;
}

interface Product {
    id: number; name: string; short_description: string | null; description: string | null;
    material: string | null; application: string | null; manufacturing_process: string | null;
    featured_image: string | null; images: ProductImage[];
    category: { id: number; name: string; slug: string } | null;
}

export default function Show({
    product, seo, breadcrumb, schema, preview,
}: {
    product: Product;
    seo: ResolvedSeo;
    breadcrumb: BreadcrumbItem[];
    schema?: Record<string, unknown> | null;
    preview: boolean;
}) {
    const { t } = useLocale();
    const gallery = [
        ...(product.featured_image ? [{ id: 0, path: product.featured_image, alt_text: product.name }] : []),
        ...product.images,
    ];
    const [active, setActive] = useState(0);
    const activeImage = gallery[active] ?? null;

    const specs = [
        ['Category', product.category?.name ?? null],
        ['Material', product.material],
        ['Application', product.application],
        ['Manufacturing Process', product.manufacturing_process],
    ].filter(([, value]) => Boolean(value)) as [string, string][];

    return (
        <PublicLayout>
            <SeoHead seo={seo} schema={schema} />

            {preview && (
                <div className="bg-warning/10 px-5 py-2 text-center text-sm font-medium text-warning">
                    {t('Draft preview — this product is not publicly visible.')}
                </div>
            )}

            <div className="mx-auto max-w-content px-5 py-12 sm:px-6 lg:px-8">
                <Breadcrumb items={breadcrumb} />

                <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2">
                    <div>
                        <div data-reveal="image" className="aspect-square w-full bg-muted">
                            {activeImage ? (
                                <img
                                    src={`/storage/${activeImage.path}`}
                                    alt={activeImage.alt_text ?? product.name}
                                    className="h-full w-full object-cover"
                                    loading="eager"
                                />
                            ) : (
                                <ImagePlaceholder />
                            )}
                        </div>

                        {gallery.length > 1 && (
                            <div data-reveal-group className="mt-4 grid grid-cols-5 gap-3">
                                {gallery.map((image, index) => (
                                    <button
                                        key={image.id}
                                        type="button"
                                        onClick={() => setActive(index)}
                                        aria-label={`Show image ${index + 1} of ${gallery.length}`}
                                        aria-current={index === active}
                                        className={`aspect-square w-full overflow-hidden bg-muted ${index === active ? 'ring-2 ring-navy-900' : 'opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={`/storage/${image.path}`} alt="" loading="lazy" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div data-reveal="auto">
                        {product.category && <p className="text-caption uppercase text-muted-foreground">{product.category.name}</p>}
                        <h1 className="mt-2 text-h2 text-navy-900" style={{ textWrap: 'balance' }}>{product.name}</h1>
                        {product.short_description && <p className="mt-4 text-body-lg text-slate-700">{product.short_description}</p>}
                        {product.description && <p className="mt-6 text-body text-slate-700">{product.description}</p>}

                        {specs.length > 0 && (
                            <dl data-reveal-group className="mt-10 divide-y divide-border border-t border-border">
                                {specs.map(([label, value]) => (
                                    <div key={label} className="flex justify-between gap-4 py-3">
                                        <dt className="text-small text-muted-foreground">{t(label)}</dt>
                                        <dd className="text-small font-medium text-foreground">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
