import { router } from '@inertiajs/react';

import { Pagination } from '@/components/admin/Pagination';
import { ProductShowcase, ProductShowcaseItem } from '@/components/public/ProductShowcase';
import { SectionHeader } from '@/components/public/SectionHeader';
import { SeoHead } from '@/components/public/SeoHead';
import { useLocale } from '@/hooks/use-locale';
import PublicLayout from '@/layouts/PublicLayout';
import { ResolvedSeo } from '@/types/cms';

export default function Index({
    products, categories, filters, seo,
}: {
    products: { data: ProductShowcaseItem[]; links: { url: string | null; label: string; active: boolean }[] };
    categories: { id: number; name: string; slug: string }[];
    filters: { category?: string };
    seo: ResolvedSeo;
}) {
    const { localizedRoute, t } = useLocale();
    return (
        <PublicLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border">
                <div className="mx-auto max-w-content px-5 py-16 sm:px-6 lg:px-8">
                    <SectionHeader
                        as="h1"
                        eyebrow={t('What We Make')}
                        heading={t('Products')}
                        description={t('Precision components produced for our manufacturing partners.')}
                    />
                </div>
            </section>

            <div className="mx-auto max-w-content px-5 py-12 sm:px-6 lg:px-8">
                {categories.length > 0 && (
                    <div className="mb-10 flex flex-wrap gap-2 border-b border-border pb-8">
                        <button
                            onClick={() => router.get(localizedRoute('public.products'))}
                            className={`text-sm font-medium ${!filters.category ? 'text-navy-900' : 'text-muted-foreground hover:text-navy-900'}`}
                        >
                            {t('All')}
                        </button>
                        {categories.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => router.get(localizedRoute('public.products'), { category: c.slug })}
                                className={`text-sm font-medium ${filters.category === c.slug ? 'text-navy-900' : 'text-muted-foreground hover:text-navy-900'}`}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                )}

                {products.data.length === 0 ? (
                    <p className="text-small text-muted-foreground">{t('No products published yet.')}</p>
                ) : (
                    <ProductShowcase items={products.data} />
                )}

                <div className="mt-12">
                    <Pagination links={products.links} />
                </div>
            </div>
        </PublicLayout>
    );
}
