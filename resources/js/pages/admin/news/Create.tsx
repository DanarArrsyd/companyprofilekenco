import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { MediaPickerField } from '@/components/admin/MediaPicker';
import { PageHeader } from '@/components/admin/PageHeader';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { SEO_FIELDS_DEFAULT, SeoFields, SeoFieldsData } from '@/components/admin/SeoFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';

export default function Create({
    categories,
    statusOptions,
}: {
    categories: { id: number; name: string }[];
    statusOptions: string[];
}) {
    const { data, setData, post, processing, errors } = useForm<{
        news_category_id: string;
        title: string;
        slug: string;
        excerpt: string;
        content: string;
        featured_image: File | null;
        featured_image_path: string;
        is_featured: boolean;
        status: string;
        published_at: string;
        seo: SeoFieldsData;
    }>({
        news_category_id: '',
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image: null,
        featured_image_path: '',
        is_featured: false,
        status: 'draft',
        published_at: '',
        seo: SEO_FIELDS_DEFAULT,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.news.store'), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title="New Article" />
            <PageHeader title="New Article" breadcrumbs={[{ label: 'Articles', href: route('admin.news') }, { label: 'New' }]} />

            <form onSubmit={submit} className="rounded border border-border bg-surface px-6">
                <FormSection title="General">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} className="mt-1.5" autoFocus />
                        {errors.title && <p className="mt-1 text-sm text-danger">{errors.title}</p>}
                    </div>
                    <div>
                        <Label htmlFor="slug">Slug (optional)</Label>
                        <Input id="slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} className="mt-1.5" placeholder="Auto-generated from title" />
                        {errors.slug && <p className="mt-1 text-sm text-danger">{errors.slug}</p>}
                    </div>
                    <div>
                        <Label htmlFor="news_category_id">Category</Label>
                        <select id="news_category_id" value={data.news_category_id} onChange={(e) => setData('news_category_id', e.target.value)} className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm">
                            <option value="">No category</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="excerpt">Excerpt</Label>
                        <textarea id="excerpt" value={data.excerpt} onChange={(e) => setData('excerpt', e.target.value)} rows={2} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                </FormSection>

                <FormSection title="Content">
                    <div>
                        <Label>Body</Label>
                        <RichTextEditor value={data.content} onChange={(html) => setData('content', html)} />
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
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)} className="rounded border-border" />
                        Featured article
                    </label>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select id="status" value={data.status} onChange={(e) => setData('status', e.target.value)} className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm">
                            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="published_at">Published at</Label>
                        <Input id="published_at" type="datetime-local" value={data.published_at} onChange={(e) => setData('published_at', e.target.value)} className="mt-1.5" />
                    </div>
                </FormSection>

                <FormSection title="SEO">
                    <SeoFields
                        data={data.seo}
                        onChange={(patch) => setData('seo', { ...data.seo, ...patch })}
                        errors={errors}
                        titleFallback={data.title || 'New Article'}
                        pageUrl={`/news/${data.slug || '...'}`}
                    />
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={processing}>Create Article</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
