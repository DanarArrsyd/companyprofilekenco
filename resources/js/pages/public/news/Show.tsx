import { Link } from '@inertiajs/react';
import { Mail } from 'lucide-react';

import defaultCover from '../../../../img/news_cover_default.webp';

import { ArticlePreview, ArticlePreviewItem } from '@/components/public/ArticlePreview';
import { BrandIcon } from '@/components/public/BrandIcon';
import { Breadcrumb, BreadcrumbItem } from '@/components/public/Breadcrumb';
import { SeoHead } from '@/components/public/SeoHead';
import { useLocale } from '@/hooks/use-locale';
import { IMAGE_SIZES, responsiveImage } from '@/lib/responsive-image';
import PublicLayout from '@/layouts/PublicLayout';
import { Container } from '@/components/public/Section';
import { ResolvedSeo } from '@/types/cms';

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    featured_image: string | null;
    published_at: string | null;
    category: { id: number; name: string; slug: string } | null;
    author: { id: number; name: string } | null;
}

function ShareLinks({ title, url }: { title: string; url: string }) {
    const { t } = useLocale();
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const linkClass = 'inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-navy-900 transition-colors hover:border-navy-700 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700';

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-small font-medium text-slate-700">{t('Share')}:</span>
            <a
                href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('Share on WhatsApp')}
                className={linkClass}
            >
                <BrandIcon brand="whatsapp" className="h-5 w-5" />
            </a>
            <a
                href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
                aria-label={t('Share by email')}
                className={linkClass}
            >
                <Mail className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('Share on Facebook')}
                className={linkClass}
            >
                <BrandIcon brand="facebook" className="h-5 w-5" />
            </a>
            <a
                href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('Share on Twitter')}
                className={linkClass}
            >
                <BrandIcon brand="twitter" className="h-5 w-5" />
            </a>
        </div>
    );
}

export default function Show({ article, relatedArticles, seo, breadcrumb, schema, preview, readingMinutes }: {
    article: Article;
    relatedArticles: ArticlePreviewItem[];
    seo: ResolvedSeo;
    breadcrumb: BreadcrumbItem[];
    schema?: Array<Record<string, unknown> | null>;
    preview: boolean;
    readingMinutes: number;
}) {
    const { t, formatDate, localize, localizedRoute } = useLocale();
    const shareUrl = seo.canonical_url ?? localizedRoute('public.news.show', article.slug);
    const coverImage = article.featured_image ?? defaultCover;

    return (
        <PublicLayout heroVariant={preview ? 'solid' : 'transparent-dark'}>
            <SeoHead seo={seo} schema={schema} />

            {preview && (
                <div className="bg-warning/10 px-5 py-2 text-center text-small font-medium text-warning">
                    {t('Draft preview — this article is not publicly visible.')}
                </div>
            )}

            <section className="relative isolate mx-3 min-h-[28rem] overflow-hidden rounded-b-[2.5rem] bg-navy-900 sm:mx-5 sm:min-h-[34rem] lg:mx-6 lg:min-h-[36rem]">
                <img
                    {...responsiveImage(coverImage, IMAGE_SIZES.full)}
                    alt=""
                    loading="eager"
                    fetchPriority="high"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-navy-900/20" aria-hidden="true" />
                {article.excerpt && (
                    <div className="relative mx-auto flex min-h-[28rem] w-full max-w-content items-end px-5 pb-10 pt-28 sm:min-h-[34rem] sm:px-6 sm:pb-14 lg:min-h-[36rem] lg:px-8 lg:pb-16">
                        <p className="max-w-3xl rounded-2xl bg-navy-900/70 px-5 py-4 text-body font-medium text-white backdrop-blur-sm sm:px-7 sm:py-6">
                            {article.excerpt}
                        </p>
                    </div>
                )}
            </section>

            <Container spacing="content">
                <div className="inline-flex max-w-full rounded-md border border-border px-3 py-2">
                    <Breadcrumb items={breadcrumb} />
                </div>

                <article className="mt-10">
                    <header>
                        <h1 className="max-w-[72rem] text-balance text-h1 text-charcoal">{article.title}</h1>
                        <div className="mt-6 flex flex-col gap-5 border-b border-border pb-8 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-small text-slate-700">
                                {article.category && (
                                    <Link
                                        href={localize(`/news?category=${article.category.slug}`)}
                                        className="rounded-full border border-navy-700 px-3 py-1 font-medium text-navy-700 hover:bg-muted"
                                    >
                                        {article.category.name}
                                    </Link>
                                )}
                                {article.published_at && <span>{formatDate(article.published_at)}</span>}
                                {article.published_at && <span aria-hidden="true">·</span>}
                                <span>{t(':count min read', { count: readingMinutes })}</span>
                                {article.author && (
                                    <>
                                        <span aria-hidden="true">·</span>
                                        <span>{t('By :name', { name: article.author.name })}</span>
                                    </>
                                )}
                            </div>
                            {!preview && <ShareLinks title={article.title} url={shareUrl} />}
                        </div>
                    </header>

                    <div className="mt-12 max-w-[72rem]">
                        {article.content ? (
                            <div className="article-prose" dangerouslySetInnerHTML={{ __html: article.content }} />
                        ) : article.excerpt ? (
                            <p className="text-body-lg text-slate-700">{article.excerpt}</p>
                        ) : null}
                    </div>
                </article>

                {relatedArticles.length > 0 && (
                    <section aria-labelledby="related-articles-heading" className="mt-20 border-t border-border pt-12">
                        <p className="text-caption uppercase text-muted-foreground">{t('Keep Reading')}</p>
                        <h2 id="related-articles-heading" className="mt-2 text-h3 text-navy-900">{t('Related Articles')}</h2>
                        <div data-reveal-group className="mt-8 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-3">
                            {relatedArticles.map((related) => <ArticlePreview key={related.id} article={related} />)}
                        </div>
                    </section>
                )}
            </Container>
        </PublicLayout>
    );
}
