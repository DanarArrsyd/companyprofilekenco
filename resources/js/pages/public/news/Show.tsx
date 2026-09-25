import { ArticlePreview, ArticlePreviewItem } from '@/components/public/ArticlePreview';
import { Breadcrumb, BreadcrumbItem } from '@/components/public/Breadcrumb';
import { ImagePlaceholder } from '@/components/public/ImagePlaceholder';
import { SeoHead } from '@/components/public/SeoHead';
import { useLocale } from '@/hooks/use-locale';
import PublicLayout from '@/layouts/PublicLayout';
import { ResolvedSeo } from '@/types/cms';
import { Container } from '@/components/public/Section';

interface Article {
    id: number; title: string; excerpt: string | null; content: string | null;
    featured_image: string | null; published_at: string | null;
    category: { id: number; name: string; slug: string } | null;
    author: { id: number; name: string } | null;
}

export default function Show({
    article, relatedArticles, seo, breadcrumb, schema, preview,
}: {
    article: Article;
    relatedArticles: ArticlePreviewItem[];
    seo: ResolvedSeo;
    breadcrumb: BreadcrumbItem[];
    schema?: Array<Record<string, unknown> | null>;
    preview: boolean;
}) {
    const { t, formatDate } = useLocale();
    return (
        <PublicLayout>
            <SeoHead seo={seo} schema={schema} />

            {preview && (
                <div className="bg-warning/10 px-5 py-2 text-center text-small font-medium text-warning">
                    {t('Draft preview — this article is not publicly visible.')}
                </div>
            )}

            <Container spacing="content">
                <Breadcrumb items={breadcrumb} />

                <article className="mx-auto mt-8 max-w-[47.5rem]">
                    {article.category && <p className="text-caption uppercase text-muted-foreground">{article.category.name}</p>}
                    <h1 className="text-balance mt-2 text-h2 text-navy-900">{article.title}</h1>
                    <div className="mt-4 flex items-center gap-3 text-small text-muted-foreground">
                        {article.published_at && <span>{formatDate(article.published_at)}</span>}
                        {article.author && <span>By {article.author.name}</span>}
                    </div>

                    <div className="mt-8 aspect-[16/9] w-full bg-muted">
                        {article.featured_image ? (
                            <img
                                src={`/storage/${article.featured_image}`}
                                alt={article.title}
                                loading="eager"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <ImagePlaceholder />
                        )}
                    </div>

                    {article.content && (
                        <div className="article-prose mt-10" dangerouslySetInnerHTML={{ __html: article.content }} />
                    )}
                </article>

                {relatedArticles.length > 0 && (
                    <div className="mx-auto mt-20 max-w-content border-t border-border pt-12">
                        <p className="text-caption uppercase text-muted-foreground">{t('Keep Reading')}</p>
                        <h2 className="mt-2 text-h3 text-navy-900">{t('Related Articles')}</h2>
                        <div data-reveal-group className="mt-8 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-3">
                            {relatedArticles.map((related) => <ArticlePreview key={related.id} article={related} />)}
                        </div>
                    </div>
                )}
            </Container>
        </PublicLayout>
    );
}
