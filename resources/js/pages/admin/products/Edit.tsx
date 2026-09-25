import { Head, router, useForm } from '@inertiajs/react';
import { Eye, Plus, Star, Trash2 } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { ContentLocaleTabs, LocaleBadge } from '@/components/admin/ContentLocaleTabs';
import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { MediaLibraryButton, MediaPickerField } from '@/components/admin/MediaPicker';
import { PageHeader } from '@/components/admin/PageHeader';
import { SEO_FIELDS_DEFAULT, SeoFields, SeoFieldsData, seoTranslations } from '@/components/admin/SeoFields';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePermissions } from '@/hooks/use-permissions';
import AdminLayout from '@/layouts/AdminLayout';
import { mediaUrl } from '@/lib/media';
import { countTranslated, initialTranslations, translatableBinder, translatableError, type ContentLocale, type TranslationValues } from '@/lib/translatable-form';
import { fromDateTimeInput, toDateTimeInput } from '@/lib/datetime-input';

interface ProductImage {
    id: number;
    path: string;
    alt_text: string | null;
    is_primary: boolean;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    short_description: string | null;
    description: string | null;
    material: string | null;
    application: string | null;
    manufacturing_process: string | null;
    featured_image: string | null;
    is_featured: boolean;
    status: string;
    published_at: string | null;
    product_category_id: number | null;
    images: ProductImage[];
    seo_metadata: {
        meta_title: string | null; meta_description: string | null; canonical_url: string | null;
        og_title: string | null; og_description: string | null; og_image: string | null;
        robots_index: boolean; robots_follow: boolean;
    } | null;
}

const TRANSLATABLE_FIELDS = ['short_description', 'description', 'material', 'application', 'manufacturing_process'];

export default function Edit({
    product,
    categories,
    statusOptions,
}: {
    product: Product;
    categories: { id: number; name: string }[];
    statusOptions: string[];
}) {
    const { can } = usePermissions();
    const [imageToDelete, setImageToDelete] = useState<ProductImage | null>(null);
    const [galleryProcessing, setGalleryProcessing] = useState(false);
    const [galleryError, setGalleryError] = useState<string | null>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm<{
        _method: string;
        product_category_id: string;
        name: string;
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
        translations: initialTranslations(product, TRANSLATABLE_FIELDS),
        _method: 'put',
        product_category_id: product.product_category_id ? String(product.product_category_id) : '',
        name: product.name,
        short_description: product.short_description ?? '',
        description: product.description ?? '',
        material: product.material ?? '',
        application: product.application ?? '',
        manufacturing_process: product.manufacturing_process ?? '',
        featured_image: null,
        featured_image_path: product.featured_image ?? '',
        is_featured: product.is_featured,
        status: product.status,
        published_at: product.published_at ?? '',
        seo: {
            ...SEO_FIELDS_DEFAULT,
            translations: seoTranslations(product.seo_metadata),
            meta_title: product.seo_metadata?.meta_title ?? '',
            meta_description: product.seo_metadata?.meta_description ?? '',
            canonical_url: product.seo_metadata?.canonical_url ?? '',
            og_title: product.seo_metadata?.og_title ?? '',
            og_description: product.seo_metadata?.og_description ?? '',
            og_image_path: product.seo_metadata?.og_image ?? '',
            robots_index: product.seo_metadata?.robots_index ?? true,
            robots_follow: product.seo_metadata?.robots_follow ?? true,
        },
    });

    const [contentLocale, setContentLocale] = useState<ContentLocale>('en');
    const bind = translatableBinder(data, setData, contentLocale);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.products.update', product.id), { forceFormData: true });
    };

    const addGalleryImage = (payload: { image?: File; media_path?: string }) => {
        if (galleryProcessing) return;

        setGalleryProcessing(true);
        setGalleryError(null);
        router.post(route('admin.products.images.store', product.id), payload, {
            forceFormData: true,
            preserveScroll: true,
            onError: (requestErrors) => {
                setGalleryError(
                    requestErrors.image
                    ?? requestErrors.media_path
                    ?? 'Image could not be added. Please try again.',
                );
            },
            onFinish: () => setGalleryProcessing(false),
        });
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${product.name}`} />

            <PageHeader
                title={product.name}
                breadcrumbs={[{ label: 'Products', href: route('admin.products') }, { label: 'Edit' }]}
                actions={
                    <div className="flex items-center gap-2">
                        <StatusBadge status={product.status} />
                        <a href={route('admin.products.preview', product.id)} target="_blank" rel="noreferrer">
                            <Button variant="secondary" size="sm"><Eye className="mr-2 h-4 w-4" />Preview</Button>
                        </a>
                        {can('products.update') && product.status !== 'published' && (
                            <Button size="sm" onClick={() => router.post(route('admin.products.publish', product.id))}>Publish</Button>
                        )}
                        {can('products.update') && product.status !== 'archived' && (
                            <Button variant="secondary" size="sm" onClick={() => router.post(route('admin.products.archive', product.id))}>Archive</Button>
                        )}
                    </div>
                }
            />

            <div className="space-y-6">
                <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                    <ContentLocaleTabs value={contentLocale} onChange={setContentLocale} translated={countTranslated(data.translations.id)} total={TRANSLATABLE_FIELDS.length} />
                    <FormSection title="General Information">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1.5" />
                            {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
                        </div>
                        <div>
                            <Label>Slug</Label>
                            <p className="mt-1.5 rounded border border-border bg-muted px-3 py-2 text-sm text-slate-700">/products/{product.slug}</p>
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

                    <FormSection title="Media" description="Featured image shown on listings and detail page.">
                        <MediaPickerField
                            label="Featured Image"
                            currentFile={data.featured_image}
                            currentUrl={mediaUrl(data.featured_image_path)}
                            onUploadFile={(file) => { setData('featured_image', file); setData('featured_image_path', ''); }}
                            onSelectPath={(path) => { setData('featured_image_path', path); setData('featured_image', null); }}
                            onClear={() => { setData('featured_image', null); setData('featured_image_path', ''); }}
                            error={errors.featured_image ?? errors.featured_image_path}
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
                            <Input id="published_at" type="datetime-local" value={toDateTimeInput(data.published_at)} onChange={(e) => setData('published_at', fromDateTimeInput(e.target.value))} className="mt-1.5" />
                        </div>
                    </FormSection>

                    <FormSection title="SEO">
                        <SeoFields
                            locale={contentLocale}
                            data={data.seo}
                            onChange={(patch) => setData('seo', { ...data.seo, ...patch })}
                            errors={errors}
                            titleFallback={product.name}
                            pageUrl={`/products/${product.slug}`}
                        />
                    </FormSection>

                    <FormActions>
                        <Button type="submit" disabled={processing}>Save Changes</Button>
                    </FormActions>
                </form>

                <div className="rounded-lg border border-border bg-surface p-6 sm:p-8">
                    <h2 className="text-sm font-semibold text-foreground">Product Gallery</h2>
                    <p className="mt-1 text-sm text-slate-500">Additional images shown on the product detail page.</p>

                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {product.images.map((image) => (
                            <div key={image.id} className="group relative overflow-hidden rounded border border-border">
                                <img src={mediaUrl(image.path) ?? ''} alt={image.alt_text ?? ''} className="aspect-square w-full object-cover" />
                                {image.is_primary && (
                                    <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                                        <Star className="h-3 w-3" />
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setImageToDelete(image)}
                                    className="absolute right-1 top-1 rounded bg-danger p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                    aria-label="Remove image"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            disabled={galleryProcessing}
                            className="flex aspect-square items-center justify-center rounded border border-dashed border-border text-muted-foreground hover:border-navy-700 hover:text-navy-700"
                            aria-label="Upload gallery image"
                        >
                            <Plus className="h-6 w-6" />
                        </button>
                        <input
                            ref={galleryInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) addGalleryImage({ image: file });
                                e.target.value = '';
                            }}
                        />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <MediaLibraryButton
                            disabled={galleryProcessing}
                            onSelectPath={(path) => addGalleryImage({ media_path: path })}
                        />
                        <p className="text-xs text-slate-500">
                            {galleryProcessing
                                ? 'Adding image…'
                                : 'Upload a new image or reuse one from the Media Library.'}
                        </p>
                    </div>
                    {galleryError && <p role="alert" className="mt-2 text-sm text-danger">{galleryError}</p>}
                </div>
            </div>

            <ConfirmDialog
                open={imageToDelete !== null}
                title="Remove this image?"
                confirmLabel="Remove"
                destructive
                onCancel={() => setImageToDelete(null)}
                onConfirm={() => {
                    if (imageToDelete) {
                        router.delete(route('admin.products.images.destroy', [product.id, imageToDelete.id]), { preserveScroll: true });
                    }
                    setImageToDelete(null);
                }}
            />
        </AdminLayout>
    );
}
