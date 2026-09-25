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
import { countTranslated, initialTranslations, translatableBinder, translatableError, type ContentLocale, type TranslationValues } from '@/lib/translatable-form';
import { fromDateTimeInput, toDateTimeInput } from '@/lib/datetime-input';
import { FieldHint } from '@/components/admin/FieldHint';
import { fieldHelp } from '@/lib/admin-field-help';

const TRANSLATABLE_FIELDS = ['name', 'summary', 'description'];

export default function Create({ statusOptions }: { statusOptions: string[] }) {
    const { data, setData, post, processing, errors } = useForm<{
        name: string; slug: string; summary: string; description: string; icon: string;
        featured_image: File | null; featured_image_path: string; is_featured: boolean; sort_order: number;
        status: string; published_at: string;
        seo: SeoFieldsData;
        translations: { id: TranslationValues };
    }>({
        translations: initialTranslations(null, TRANSLATABLE_FIELDS),
        name: '', slug: '', summary: '', description: '', icon: '',
        featured_image: null, featured_image_path: '', is_featured: false, sort_order: 0,
        status: 'draft', published_at: '',
        seo: SEO_FIELDS_DEFAULT,
    });

    const [contentLocale, setContentLocale] = useState<ContentLocale>('en');
    const bind = translatableBinder(data, setData, contentLocale);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.capabilities.store'), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title="New Capability" />
            <PageHeader title="New Capability" breadcrumbs={[{ label: 'Capabilities', href: route('admin.capabilities') }, { label: 'New' }]} />

            <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                <ContentLocaleTabs value={contentLocale} onChange={setContentLocale} translated={countTranslated(data.translations.id)} total={TRANSLATABLE_FIELDS.length} />
                <FormSection title="General">
                    <div>
                        <Label htmlFor="name">Name<LocaleBadge locale={contentLocale} /></Label>
                        <Input id="name" {...bind('name', fieldHelp('capabilities', 'name').example)} className="mt-1.5" autoFocus />
                        {translatableError(errors, 'name', contentLocale) && <p className="mt-1 text-sm text-danger">{translatableError(errors, 'name', contentLocale)}</p>}
                    </div>
                    <div>
                        <Label htmlFor="slug">Slug (optional)</Label>
                        <Input id="slug" aria-describedby="slug-help" placeholder={fieldHelp('capabilities', 'slug').example} value={data.slug} onChange={(e) => setData('slug', e.target.value)} className="mt-1.5" />
                        <FieldHint id="slug-help">{fieldHelp('capabilities', 'slug').hint}</FieldHint>
                    </div>
                    <div>
                        <Label htmlFor="summary">Summary<LocaleBadge locale={contentLocale} /></Label>
                        <Input id="summary" aria-describedby="summary-help" {...bind('summary', fieldHelp('capabilities', 'summary').example)} className="mt-1.5" />
                        <FieldHint id="summary-help">{fieldHelp('capabilities', 'summary').hint}</FieldHint>
                    </div>
                    <div>
                        <Label htmlFor="description">Description<LocaleBadge locale={contentLocale} /></Label>
                        <textarea id="description" {...bind('description')} rows={5} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <Label htmlFor="icon">Icon (lucide icon name, optional)</Label>
                        <Input id="icon" aria-describedby="icon-help" value={data.icon} onChange={(e) => setData('icon', e.target.value)} className="mt-1.5" placeholder="e.g. Wrench" />
                        <FieldHint id="icon-help">{fieldHelp('capabilities', 'icon').hint}</FieldHint>
                    </div>
                </FormSection>

                <FormSection title="Media">
                    <MediaPickerField
                        label="Featured Image"
                        currentUrl={data.featured_image ? URL.createObjectURL(data.featured_image) : (data.featured_image_path ? `/storage/${data.featured_image_path}` : null)}
                        onUploadFile={(file) => { setData('featured_image', file); setData('featured_image_path', ''); }}
                        onSelectPath={(path) => { setData('featured_image_path', path); setData('featured_image', null); }}
                        onClear={() => { setData('featured_image', null); setData('featured_image_path', ''); }}
                    />
                </FormSection>

                <FormSection title="Publishing">
                    <div>
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)} className="rounded border-border" />
                            Featured capability
                        </label>
                        <FieldHint>{fieldHelp('capabilities', 'is_featured').hint}</FieldHint>
                    </div>
                    <div>
                        <Label htmlFor="sort_order">Sort order</Label>
                        <Input id="sort_order" aria-describedby="sort_order-help" type="number" value={data.sort_order} onChange={(e) => setData('sort_order', Number(e.target.value))} className="mt-1.5" />
                        <FieldHint id="sort_order-help">{fieldHelp('capabilities', 'sort_order').hint}</FieldHint>
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select id="status" aria-describedby="status-help" value={data.status} onChange={(e) => setData('status', e.target.value)} className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm">
                            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <FieldHint id="status-help">{fieldHelp('capabilities', 'status').hint}</FieldHint>
                    </div>
                    <div>
                        <Label htmlFor="published_at">Published at</Label>
                        <Input id="published_at" aria-describedby="published_at-help" type="datetime-local" value={toDateTimeInput(data.published_at)} onChange={(e) => setData('published_at', fromDateTimeInput(e.target.value))} className="mt-1.5" />
                        <FieldHint id="published_at-help">{fieldHelp('capabilities', 'published_at').hint}</FieldHint>
                    </div>
                </FormSection>

                <FormSection title="SEO">
                    <SeoFields
                            locale={contentLocale}
                        data={data.seo}
                        onChange={(patch) => setData('seo', { ...data.seo, ...patch })}
                        errors={errors}
                        titleFallback={data.name || 'New Capability'}
                        pageUrl={`/capabilities/${data.slug || '...'}`}
                    />
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={processing}>Create Capability</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
