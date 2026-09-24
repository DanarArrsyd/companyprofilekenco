import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import { ContentLocaleTabs, LocaleBadge } from '@/components/admin/ContentLocaleTabs';
import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { MediaPickerField } from '@/components/admin/MediaPicker';
import { PageHeader } from '@/components/admin/PageHeader';
import { SEO_FIELDS_DEFAULT, SeoFields, SeoFieldsData } from '@/components/admin/SeoFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';
import { mediaUrl } from '@/lib/media';
import { countTranslated, initialTranslations, translatableBinder, translatableError, type ContentLocale, type TranslationValues } from '@/lib/translatable-form';

const TRANSLATABLE_FIELDS = ['short_description', 'description', 'material', 'application', 'manufacturing_process'];

export default function Create({
    categories,
    statusOptions,
}: {
    categories: { id: number; name: string }[];
    statusOptions: string[];
}) {
    const { data, setData, post, processing, errors } = useForm<{
        product_category_id: string;
        name: string;
        slug: string;
        short_description: string;
        description: string;
        material: string;
        application: string;
        manufacturing_process: string;
        featured_image: File | null;
        featured_image_path: string;
        is_featured: boolean;
        status: string;
        published_at: string;
        seo: SeoFieldsData;
        translations: { id: TranslationValues };
    }>({
        translations: initialTranslations(null, TRANSLATABLE_FIELDS),
        product_category_id: '',
        name: '',
        slug: '',
        short_description: '',
        description: '',
        material: '',
        application: '',
        manufacturing_process: '',
        featured_image: null,
        featured_image_path: '',
        is_featured: false,
        status: 'draft',
        published_at: '',
        seo: SEO_FIELDS_DEFAULT,
    });

    const [contentLocale, setContentLocale] = useState<ContentLocale>('en');
    const bind = translatableBinder(data, setData, contentLocale);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.products.store'), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title="New Product" />
            <PageHeader title="New Product" breadcrumbs={[{ label: 'Products', href: route('admin.products') }, { label: 'New' }]} />

            <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                <ContentLocaleTabs value={contentLocale} onChange={setContentLocale} translated={countTranslated(data.translations.id)} total={TRANSLATABLE_FIELDS.length} />
                <FormSection title="General Information">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1.5" autoFocus />
                        {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
                    </div>
                    <div>
                        <Label htmlFor="slug">Slug (optional)</Label>
                        <Input id="slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} className="mt-1.5" placeholder="Auto-generated from name" />
                        {errors.slug && <p className="mt-1 text-sm text-danger">{errors.slug}</p>}
                    </div>
                    <div>
                        <Label htmlFor="product_category_id">Category</Label>
                        <select id="product_category_id" value={data.product_category_id} onChange={(e) => setData('product_category_id', e.target.value)} className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm">
                            <option value="">No category</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="short_description">Short Description<LocaleBadge locale={contentLocale} /></Label>
                        <Input id="short_description" {...bind('short_description')} className="mt-1.5" />
                    </div>
                </FormSection>

                <FormSection title="Product Detail">
                    <div>
                        <Label htmlFor="description">Description<LocaleBadge locale={contentLocale} /></Label>
                        <textarea id="description" {...bind('description')} rows={5} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <Label htmlFor="material">Material<LocaleBadge locale={contentLocale} /></Label>
                        <Input id="material" {...bind('material')} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor="application">Application<LocaleBadge locale={contentLocale} /></Label>
                        <Input id="application" {...bind('application')} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor="manufacturing_process">Manufacturing Process<LocaleBadge locale={contentLocale} /></Label>
                        <Input id="manufacturing_process" {...bind('manufacturing_process')} className="mt-1.5" />
                    </div>
                </FormSection>

                <FormSection title="Media" description="Featured image. Product gallery can be managed after creating the product.">
                        <MediaPickerField
                            label="Featured Image"
                            currentFile={data.featured_image}
                            currentUrl={mediaUrl(data.featured_image_path)}
                        onUploadFile={(file) => { setData('featured_image', file); setData('featured_image_path', ''); }}
                        onSelectPath={(path) => { setData('featured_image_path', path); setData('featured_image', null); }}
                        onClear={() => { setData('featured_image', null); setData('featured_image_path', ''); }}
                        error={errors.featured_image}
                    />
                </FormSection>

                <FormSection title="Publishing">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)} className="rounded border-border" />
                        Featured product
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
                            locale={contentLocale}
                        data={data.seo}
                        onChange={(patch) => setData('seo', { ...data.seo, ...patch })}
                        errors={errors}
                        titleFallback={data.name || 'New Product'}
                        pageUrl={`/products/${data.slug || '...'}`}
                    />
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={processing}>Create Product</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
