import { Link, router } from '@inertiajs/react';
import { ArrowRight, Search } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import { Pagination } from '@/components/admin/Pagination';
import { ArticlePreviewItem } from '@/components/public/ArticlePreview';
import { Breadcrumb } from '@/components/public/Breadcrumb';
import { ImagePlaceholder } from '@/components/public/ImagePlaceholder';
import { ScrollReveal } from '@/components/public/ScrollReveal';
import { SeoHead } from '@/components/public/SeoHead';
import { useLocale } from '@/hooks/use-locale';
import { IMAGE_SIZES, responsiveImage } from '@/lib/responsive-image';
import PublicLayout from '@/layouts/PublicLayout';
import { Container, Section } from '@/components/public/Section';
import { ResolvedSeo } from '@/types/cms';

interface NewsFilters {
    category?: string | null;
    year?: string | number | null;
    sort?: 'newest' | 'oldest';
    search?: string | null;
}

interface PaginatedArticles {
    data: ArticlePreviewItem[];
    current_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

function ArticleImage({ article, size, eager = false }: {
    article: ArticlePreviewItem;
    size: string;
    eager?: boolean;
}) {
    return article.featured_image ? (
        <img
            {...responsiveImage(article.featured_image, size)}
            alt=""
            loading={eager ? 'eager' : 'lazy'}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
        />
    ) : (
        <ImagePlaceholder />
    );
}

function CategoryPill({ name }: { name: string }) {
    return (
        <span className="inline-flex max-w-full rounded-full border border-navy-700 px-3 py-1 text-small font-medium text-navy-700">
            {name}
        </span>
    );
}

function FeaturedArticle({ article }: { article: ArticlePreviewItem }) {
    const { localizedRoute, t, formatDate } = useLocale();

    return (
        <ScrollReveal>
            <Link
                href={localizedRoute('public.news.show', article.slug)}
                className="group grid overflow-hidden rounded-2xl border border-border bg-surface lg:min-h-[26rem] lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
            >
                <div className="aspect-[16/10] overflow-hidden bg-muted lg:aspect-auto lg:h-full">
                    <ArticleImage article={article} size={IMAGE_SIZES.half} eager />
                </div>

                <div className="flex min-w-0 flex-col p-5 sm:p-8 lg:p-10">
                    <div>
                        {article.category && <CategoryPill name={article.category.name} />}
                        <h2 className="mt-5 text-balance text-h2 text-navy-900 transition-colors group-hover:text-navy-700">
                            {article.title}
                        </h2>
                        {article.excerpt && (
                            <p className="mt-4 line-clamp-3 text-body text-slate-700">{article.excerpt}</p>
                        )}
                        {article.published_at && (
                            <p className="mt-5 text-small text-slate-500">{formatDate(article.published_at)}</p>
                        )}
                    </div>

                    <span className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-navy-800 px-6 text-small font-semibold text-white transition-colors group-hover:bg-navy-900 lg:mt-auto">
                        {t('Read more')}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                </div>
            </Link>
        </ScrollReveal>
    );
}

function SupportingArticle({ article }: { article: ArticlePreviewItem }) {
    const { localizedRoute, t, formatDate } = useLocale();

    return (
        <ScrollReveal className="h-full">
            <Link
                href={localizedRoute('public.news.show', article.slug)}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface"
            >
                <div className="aspect-[16/9] overflow-hidden bg-muted">
                    <ArticleImage article={article} size={IMAGE_SIZES.third} />
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                    {article.category && <div><CategoryPill name={article.category.name} /></div>}
                    <h3 className="mt-4 line-clamp-3 text-h4 text-navy-900 transition-colors group-hover:text-navy-700">
                        {article.title}
                    </h3>
                    {article.published_at && (
                        <p className="mt-4 text-small text-slate-500">{formatDate(article.published_at)}</p>
                    )}
                    <span className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-navy-800 px-5 text-small font-semibold text-white transition-colors group-hover:bg-navy-900">
                        {t('Read more')}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                </div>
            </Link>
        </ScrollReveal>
    );
}

function ArticleListItem({ article }: { article: ArticlePreviewItem }) {
    const { localizedRoute, formatDate } = useLocale();

    return (
        <Link
            href={localizedRoute('public.news.show', article.slug)}
            className="group grid overflow-hidden border-b border-border py-6 first:pt-0 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6"
        >
            <div className="aspect-[16/10] overflow-hidden rounded-lg bg-muted">
                <ArticleImage article={article} size={IMAGE_SIZES.third} />
            </div>
            <div className="min-w-0 pt-4 sm:pt-0">
                {article.category && <p className="text-small font-medium text-navy-700">{article.category.name}</p>}
                <h3 className="mt-2 text-h4 text-navy-900 transition-colors group-hover:text-navy-700">{article.title}</h3>
                {article.excerpt && <p className="mt-2 line-clamp-2 text-small text-slate-700">{article.excerpt}</p>}
                {article.published_at && <p className="mt-3 text-small text-slate-500">{formatDate(article.published_at)}</p>}
            </div>
        </Link>
    );
}

export default function Index({ featuredArticle, articles, categories, years, filters, seo }: {
    featuredArticle: ArticlePreviewItem | null;
    articles: PaginatedArticles;
    categories: { id: number; name: string; slug: string }[];
    years: (string | number)[];
    filters: NewsFilters;
    seo: ResolvedSeo;
}) {
    const { localizedRoute, t } = useLocale();
    const [search, setSearch] = useState(filters.search ?? '');
    const year = String(filters.year ?? '');
    const sort = filters.sort ?? 'newest';
    const showFeatured = articles.current_page === 1 && !year && !filters.search && sort === 'newest';
    const supportingArticles = showFeatured
        ? articles.data.filter((article) => article.id !== featuredArticle?.id).slice(0, 3)
        : [];

    useEffect(() => setSearch(filters.search ?? ''), [filters.search]);

    function visitFilters(next: Partial<NewsFilters>) {
        const values = { ...filters, ...next };
        const query = Object.fromEntries(
            Object.entries(values).filter(([, value]) => value !== null && value !== undefined && value !== '' && value !== 'newest'),
        );

        router.get(localizedRoute('public.news'), query, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        visitFilters({ search: search.trim() });
    }

    return (
        <PublicLayout>
            <SeoHead seo={seo} />

            <Container spacing="content">
                <Breadcrumb items={[{ label: t('Home'), href: '/' }, { label: t('News') }]} />

                {showFeatured && featuredArticle ? (
                    <section aria-labelledby="featured-articles-heading" className="mt-10">
                        <h1 id="featured-articles-heading" className="mb-7 text-h2 text-navy-900">{t('Featured Articles')}</h1>
                        <FeaturedArticle article={featuredArticle} />

                        {supportingArticles.length > 0 && (
                            <div data-reveal-group className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {supportingArticles.map((article) => (
                                    <SupportingArticle key={article.id} article={article} />
                                ))}
                            </div>
                        )}
                    </section>
                ) : (
                    <h1 className="mt-10 text-h2 text-navy-900">{t('News')}</h1>
                )}
            </Container>

            <Section spacing="section" className="border-t border-border" aria-labelledby="all-articles-heading">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-caption uppercase text-slate-500">{t('Newsroom')}</p>
                        <h2 id="all-articles-heading" className="mt-2 text-h2 text-navy-900">{t('All Articles')}</h2>
                    </div>

                    <div className="flex flex-wrap items-end gap-3">
                        <label className="flex flex-col gap-1 text-small text-slate-700">
                            <span>{t('Year')}</span>
                            <select
                                value={year}
                                onChange={(event) => visitFilters({ year: event.target.value })}
                                className="min-h-11 min-w-[8rem] rounded-md border-border bg-surface text-small text-foreground focus:border-navy-700 focus:ring-navy-700"
                            >
                                <option value="">{t('All years')}</option>
                                {years.map((availableYear) => (
                                    <option key={availableYear} value={availableYear}>{availableYear}</option>
                                ))}
                            </select>
                        </label>
                        <label className="flex flex-col gap-1 text-small text-slate-700">
                            <span>{t('Sort by')}</span>
                            <select
                                value={sort}
                                onChange={(event) => visitFilters({ sort: event.target.value as NewsFilters['sort'] })}
                                className="min-h-11 min-w-[8rem] rounded-md border-border bg-surface text-small text-foreground focus:border-navy-700 focus:ring-navy-700"
                            >
                                <option value="newest">{t('Newest')}</option>
                                <option value="oldest">{t('Oldest')}</option>
                            </select>
                        </label>
                        <form onSubmit={submitSearch} role="search" className="flex min-h-11 w-full items-center rounded-md border border-border bg-surface focus-within:border-navy-700 sm:w-auto">
                            <label htmlFor="news-search" className="sr-only">{t('Search articles')}</label>
                            <input
                                id="news-search"
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={t('Search articles')}
                                className="w-full min-w-0 border-0 bg-transparent text-small text-foreground placeholder:text-slate-500 focus:ring-0 sm:w-48"
                            />
                            <button type="submit" aria-label={t('Search articles')} className="flex min-h-11 min-w-11 items-center justify-center text-slate-500 hover:text-navy-900">
                                <Search className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </form>
                    </div>
                </div>

                {categories.length > 0 && (
                    <nav aria-label={t('Category')} className="mt-8 flex flex-wrap gap-2 border-b border-border pb-6">
                        <button
                            type="button"
                            onClick={() => visitFilters({ category: null, year: null, search: null })}
                            aria-current={!filters.category ? 'page' : undefined}
                            className={`rounded-full border px-4 py-2 text-small font-medium transition-colors ${!filters.category ? 'border-navy-800 bg-navy-800 text-white' : 'border-border text-slate-700 hover:border-navy-700 hover:text-navy-900'}`}
                        >
                            {t('All')}
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => visitFilters({ category: category.slug, year: null, search: null })}
                                aria-current={filters.category === category.slug ? 'page' : undefined}
                                className={`rounded-full border px-4 py-2 text-small font-medium transition-colors ${filters.category === category.slug ? 'border-navy-800 bg-navy-800 text-white' : 'border-border text-slate-700 hover:border-navy-700 hover:text-navy-900'}`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </nav>
                )}

                {articles.data.length > 0 ? (
                    <>
                        <div className="mt-8 grid gap-x-10 lg:grid-cols-2">
                            {articles.data.map((article) => <ArticleListItem key={article.id} article={article} />)}
                        </div>
                        <div className="mt-10"><Pagination links={articles.links} /></div>
                    </>
                ) : (
                    <p className="mt-8 text-body text-slate-700">
                        {filters.search || year ? t('No articles match these filters.') : t('No articles published yet.')}
                    </p>
                )}
            </Section>
        </PublicLayout>
    );
}
