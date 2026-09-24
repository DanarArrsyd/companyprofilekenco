import { Link } from '@inertiajs/react';

import { ImagePlaceholder } from '@/components/public/ImagePlaceholder';
import { useLocale } from '@/hooks/use-locale';

export interface ArticlePreviewItem {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    featured_image?: string | null;
    published_at?: string | null;
    category?: { name: string } | null;
}

export function ArticlePreview({ article }: { article: ArticlePreviewItem }) {
    const { localize } = useLocale();
    return (
        <Link href={localize(`/news/${article.slug}`)} className="group block">
            <div className="aspect-[16/9] w-full bg-muted">
                {article.featured_image ? (
                    <img
                        src={`/storage/${article.featured_image}`}
                        alt={article.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                    />
                ) : (
                    <ImagePlaceholder />
                )}
            </div>
            <div className="mt-4">
                {(article.category || article.published_at) && (
                    <p className="text-caption uppercase text-muted-foreground">
                        {article.category?.name}
                        {article.category && article.published_at && ' · '}
                        {article.published_at && new Date(article.published_at).toLocaleDateString()}
                    </p>
                )}
                <p className="mt-2 text-h4 text-navy-900">{article.title}</p>
                {article.excerpt && <p className="mt-2 text-small text-muted-foreground">{article.excerpt}</p>}
            </div>
        </Link>
    );
}
