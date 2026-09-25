import { Head, router, useForm } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import { ContentLocaleTabs, LocaleBadge } from '@/components/admin/ContentLocaleTabs';
import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { MediaPickerField } from '@/components/admin/MediaPicker';
import { PageHeader } from '@/components/admin/PageHeader';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { SEO_FIELDS_DEFAULT, SeoFields, SeoFieldsData, seoTranslations } from '@/components/admin/SeoFields';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePermissions } from '@/hooks/use-permissions';
import AdminLayout from '@/layouts/AdminLayout';
import { countTranslated, initialTranslations, translatableBinder, translatableError, type ContentLocale, type TranslationValues } from '@/lib/translatable-form';
import { fromDateTimeInput, toDateTimeInput } from '@/lib/datetime-input';
import { FieldHint } from '@/components/admin/FieldHint';
import { fieldHelp } from '@/lib/admin-field-help';

interface Article {
    id: number; title: string; slug: string; excerpt: string | null; content: string | null;
    featured_image: string | null; is_featured: boolean; status: string; published_at: string | null;
    news_category_id: number | null;
    seo_metadata: {
        meta_title: string | null; meta_description: string | null; canonical_url: string | null;
        og_title: string | null; og_description: string | null; og_image: string | null;
        robots_index: boolean; robots_follow: boolean;
    } | null;
}

const TRANSLATABLE_FIELDS = ['title', 'excerpt', 'content'];

export default function Edit({
    article,
    categories,
    statusOptions,
}: {
    article: Article;
    categories: { id: number; name: string }[];
    statusOptions: string[];
}) {
    const { can } = usePermissions();

    const { data, setData, post, processing, errors } = useForm<{
        _method: string; news_category_id: string; title: string; excerpt: string; content: string;
        featured_image: File | null; featured_image_path: string; is_featured: boolean; status: string; published_at: string;
        seo: SeoFieldsData;
        translations: { id: TranslationValues };
    }>({
        translations: initialTranslations(article, TRANSLATABLE_FIELDS),
        _method: 'put',
        news_category_id: article.news_category_id ? String(article.news_category_id) : '',
        title: article.title,
        excerpt: article.excerpt ?? '',
        content: article.content ?? '',
        featured_image: null,
        featured_image_path: article.featured_image ?? '',
        is_featured: article.is_featured,
        status: article.status,
        published_at: article.published_at ?? '',
        seo: {
            ...SEO_FIELDS_DEFAULT,
            translations: seoTranslations(article.seo_metadata),
            meta_title: article.seo_metadata?.meta_title ?? '',
            meta_description: article.seo_metadata?.meta_description ?? '',
            canonical_url: article.seo_metadata?.canonical_url ?? '',
            og_title: article.seo_metadata?.og_title ?? '',
            og_description: article.seo_metadata?.og_description ?? '',
            og_image_path: article.seo_metadata?.og_image ?? '',
            robots_index: article.seo_metadata?.robots_index ?? true,
            robots_follow: article.seo_metadata?.robots_follow ?? true,
        },
    });

    const [contentLocale, setContentLocale] = useState<ContentLocale>('en');
    const bind = translatableBinder(data, setData, contentLocale);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.news.update', article.id), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${article.title}`} />

            <PageHeader
                title={article.title}
                breadcrumbs={[{ label: 'Articles', href: route('admin.news') }, { label: 'Edit' }]}
                actions={
                    <div className="flex items-center gap-2">
                        <StatusBadge status={article.status} />
                        <a href={route('admin.news.preview', article.id)} target="_blank" rel="noreferrer">
                            <Button variant="secondary" size="sm"><Eye className="mr-2 h-4 w-4" />Preview</Button>
                        </a>
                        {can('news.update') && article.status !== 'published' && (
                            <Button size="sm" onClick={() => router.post(route('admin.news.publish', article.id))}>Publish</Button>
                        )}
                        {can('news.update') && article.status !== 'archived' && (
                            <Button variant="secondary" size="sm" onClick={() => router.post(route('admin.news.archive', article.id))}>Archive</Button>
                        )}
                    </div>
                }
            />

            <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                <ContentLocaleTabs value={contentLocale} onChange={setContentLocale} translated={countTranslated(data.translations.id)} total={TRANSLATABLE_FIELDS.length} />
                <FormSection title="General">
                    <div>
                        <Label htmlFor="title">Title<LocaleBadge locale={contentLocale} /></Label>
                        <Input id="title" {...bind('title', fieldHelp('news', 'title').example)} className="mt-1.5" />
                        {translatableError(errors, 'title', contentLocale) && <p className="mt-1 text-sm text-danger">{translatableError(errors, 'title', contentLocale)}</p>}
                    </div>
                    <div>
                        <Label>Slug</Label>
                        <p className="mt-1.5 rounded border border-border bg-muted px-3 py-2 text-sm text-slate-700">/news/{article.slug}</p>
                    </div>
                    <div>
                        <Label htmlFor="news_category_id">Category</Label>
                        <select id="news_category_id" aria-describedby="news_category_id-help" value={data.news_category_id} onChange={(e) => setData('news_category_id', e.target.value)} className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm">
                            <option value="">No category</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <FieldHint id="news_category_id-help">{fieldHelp('news', 'news_category_id').hint}</FieldHint>
                    </div>
                    <div>
                        <Label htmlFor="excerpt">Excerpt<LocaleBadge locale={contentLocale} /></Label>
                        <textarea id="excerpt" aria-describedby="excerpt-help" {...bind('excerpt', fieldHelp('news', 'excerpt').example)} rows={2} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                        <FieldHint id="excerpt-help">{fieldHelp('news', 'excerpt').hint}</FieldHint>
                    </div>
                </FormSection>

                <FormSection title="Content">
                    <div>
                        <Label>Body</Label>
                        <RichTextEditor key={contentLocale} value={bind('content').value} onChange={bind('content').onChange} />
                    </div>
                </FormSection>

                <FormSection title="Media" description="Featured image shown on listing and detail pages.">
                    <MediaPickerField
                        label="Featured Image"
                        currentUrl={data.featured_image ? URL.createObjectURL(data.featured_image) : (data.featured_image_path ? `/storage/${data.featured_image_path}` : null)}
                        onUploadFile={(file) => { setData('featured_image', file); setData('featured_image_path', ''); }}
                        onSelectPath={(path) => { setData('featured_image_path', path); setData('featured_image', null); }}
                        onClear={() => { setData('featured_image', null); setData('featured_image_path', ''); }}
                        error={errors.featured_image}
                    />
                </FormSection>

                <FormSection title="Publishing">
                    <div>
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)} className="rounded border-border" />
                            Featured article
                        </label>
                        <FieldHint>{fieldHelp('news', 'is_featured').hint}</FieldHint>
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select id="status" aria-describedby="status-help" value={data.status} onChange={(e) => setData('status', e.target.value)} className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm">
                            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <FieldHint id="status-help">{fieldHelp('news', 'status').hint}</FieldHint>
                    </div>
                    <div>
                        <Label htmlFor="published_at">Published at</Label>
                        <Input id="published_at" aria-describedby="published_at-help" type="datetime-local" value={toDateTimeInput(data.published_at)} onChange={(e) => setData('published_at', fromDateTimeInput(e.target.value))} className="mt-1.5" />
                        <FieldHint id="published_at-help">{fieldHelp('news', 'published_at').hint}</FieldHint>
                    </div>
                </FormSection>

                <FormSection title="SEO">
                    <SeoFields
                            locale={contentLocale}
                        data={data.seo}
                        onChange={(patch) => setData('seo', { ...data.seo, ...patch })}
                        errors={errors}
                        titleFallback={article.title}
                        pageUrl={`/news/${article.slug}`}
                    />
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={processing}>Save Changes</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
