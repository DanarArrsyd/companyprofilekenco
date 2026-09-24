import { Link, router } from '@inertiajs/react';

import { Pagination } from '@/components/admin/Pagination';
import { ArticlePreview, ArticlePreviewItem } from '@/components/public/ArticlePreview';
import { ImagePlaceholder } from '@/components/public/ImagePlaceholder';
import { SectionHeader } from '@/components/public/SectionHeader';
import { SeoHead } from '@/components/public/SeoHead';
import { revealClass, useInView } from '@/hooks/use-in-view';
import PublicLayout from '@/layouts/PublicLayout';
import { ResolvedSeo } from '@/types/cms';

function FeaturedArticle({ article }: { article: ArticlePreviewItem }) {
    const { ref, inView } = useInView<HTMLDivElement>();

    return (
        <Link
            ref={ref}
            href={route('public.news.show', article.slug)}
            className={`group grid grid-cols-1 gap-8 border-b border-border pb-12 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-12 ${revealClass(inView)}`}
        >
            <div className="aspect-[16/10] w-full bg-muted">
                {article.featured_image ? (
                    <img
                        src={`/storage/${article.featured_image}`}
                        alt={article.title}
                        loading="eager"
                        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                    />
                ) : (
                    <ImagePlaceholder />
                )}
            </div>

            <div>
                <p className="text-caption uppercase text-muted-foreground">
                    Featured
                    {article.category && ` · ${article.category.name}`}
                </p>
                <h2 className="mt-3 text-h2 text-navy-900" style={{ textWrap: 'balance' }}>{article.title}</h2>
                {article.excerpt && <p className="mt-4 text-body-lg text-slate-700">{article.excerpt}</p>}
                <div className="mt-6 flex items-center gap-3 text-small text-muted-foreground">
                    {article.published_at && <span>{new Date(article.published_at).toLocaleDateString()}</span>}
                    <span className="font-medium text-navy-700 group-hover:text-navy-900">Read article &rarr;</span>
                </div>
            </div>
        </Link>
    );
}

function ArticleRow({ article }: { article: ArticlePreviewItem }) {
    const { ref, inView } = useInView<HTMLDivElement>();

    return (
        <div ref={ref} className={revealClass(inView)}>
            <ArticlePreview article={article} />
        </div>
    );
}

export default function Index({
    featuredArticle, articles, categories, filters, seo,
}: {
    featuredArticle: ArticlePreviewItem | null;
    articles: { data: ArticlePreviewItem[]; links: { url: string | null; label: string; active: boolean }[] };
    categories: { id: number; name: string; slug: string }[];
    filters: { category?: string };
    seo: ResolvedSeo;
}) {
    const isEmpty = !featuredArticle && articles.data.length === 0;

    return (
        <PublicLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border">
                <div className="mx-auto max-w-content px-5 py-16 sm:px-6 lg:px-8">
                    <SectionHeader
                        as="h1"
                        eyebrow="Newsroom"
                        heading="News"
                        description="Updates on our operations, certifications, and company milestones."
                    />
                </div>
            </section>

            <div className="mx-auto max-w-content px-5 py-12 sm:px-6 lg:px-8">
                {categories.length > 0 && (
                    <div className="mb-10 flex flex-wrap gap-2 border-b border-border pb-8">
                        <button
                            onClick={() => router.get(route('public.news'))}
                            className={`text-sm font-medium ${!filters.category ? 'text-navy-900' : 'text-muted-foreground hover:text-navy-900'}`}
                        >
                            All
                        </button>
                        {categories.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => router.get(route('public.news'), { category: c.slug })}
                                className={`text-sm font-medium ${filters.category === c.slug ? 'text-navy-900' : 'text-muted-foreground hover:text-navy-900'}`}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                )}

                {isEmpty ? (
                    <p className="text-small text-muted-foreground">No articles published yet.</p>
                ) : (
                    <>
                        {featuredArticle && (
                            <div className="mb-16">
                                <FeaturedArticle article={featuredArticle} />
                            </div>
                        )}

                        {articles.data.length > 0 && (
                            <div data-reveal-group className="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                                {articles.data.map((article) => <ArticleRow key={article.id} article={article} />)}
                            </div>
                        )}

                        <div className="mt-12">
                            <Pagination links={articles.links} />
                        </div>
                    </>
                )}
            </div>
        </PublicLayout>
    );
}
