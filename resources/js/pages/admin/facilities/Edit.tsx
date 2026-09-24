import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import { ContentLocaleTabs, LocaleBadge } from '@/components/admin/ContentLocaleTabs';
import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { MediaPickerField } from '@/components/admin/MediaPicker';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';
import { mediaUrl } from '@/lib/media';
import { countTranslated, initialTranslations, translatableBinder, translatableError, type ContentLocale, type TranslationValues } from '@/lib/translatable-form';

interface Facility {
    id: number; name: string; slug: string; facility_category_id: number | null;
    location: string | null; description: string | null; image: string | null;
    sort_order: number; status: string; published_at: string | null;
}

const TRANSLATABLE_FIELDS = ['name', 'description'];

export default function Edit({ facility, categories, statusOptions }: { facility: Facility; categories: { id: number; name: string }[]; statusOptions: string[] }) {
    const { data, setData, post, processing, errors } = useForm<{
        _method: string; facility_category_id: string; name: string; location: string; description: string;
        image: File | null; image_path: string; sort_order: number; status: string; published_at: string;
        translations: { id: TranslationValues };
    }>({
        translations: initialTranslations(facility, TRANSLATABLE_FIELDS),
        _method: 'put',
        facility_category_id: facility.facility_category_id ? String(facility.facility_category_id) : '',
        name: facility.name,
        location: facility.location ?? '',
        description: facility.description ?? '',
        image: null,
        image_path: facility.image ?? '',
        sort_order: facility.sort_order,
        status: facility.status,
        published_at: facility.published_at ? facility.published_at.slice(0, 16) : '',
    });

    const [contentLocale, setContentLocale] = useState<ContentLocale>('en');
    const bind = translatableBinder(data, setData, contentLocale);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.facilities.update', facility.id), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${facility.name}`} />
            <PageHeader title={facility.name} breadcrumbs={[{ label: 'Facilities', href: route('admin.facilities') }, { label: 'Edit' }]} />

            <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                <ContentLocaleTabs value={contentLocale} onChange={setContentLocale} translated={countTranslated(data.translations.id)} total={TRANSLATABLE_FIELDS.length} />
                <FormSection title="General">
                    <div>
                        <Label htmlFor="name">Name<LocaleBadge locale={contentLocale} /></Label>
                        <Input id="name" {...bind('name')} className="mt-1.5" />
                        {translatableError(errors, 'name', contentLocale) && <p className="mt-1 text-sm text-danger">{translatableError(errors, 'name', contentLocale)}</p>}
                    </div>
                    <div>
                        <Label>Slug</Label>
                        <p className="mt-1.5 rounded border border-border bg-muted px-3 py-2 text-sm text-slate-600">/{facility.slug}</p>
                    </div>
                    <div>
                        <Label htmlFor="facility_category_id">Category</Label>
                        <select id="facility_category_id" value={data.facility_category_id} onChange={(e) => setData('facility_category_id', e.target.value)} className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm">
                            <option value="">No category</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" value={data.location} onChange={(e) => setData('location', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor="description">Description<LocaleBadge locale={contentLocale} /></Label>
                        <textarea id="description" {...bind('description')} rows={4} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                </FormSection>

                <FormSection title="Media">
                    <MediaPickerField
                        label="Facility Image"
                        currentFile={data.image}
                        currentUrl={mediaUrl(data.image_path)}
                        onUploadFile={(file) => { setData('image', file); setData('image_path', ''); }}
                        onSelectPath={(path) => { setData('image_path', path); setData('image', null); }}
                        onClear={() => { setData('image', null); setData('image_path', ''); }}
                        error={errors.image ?? errors.image_path}
                    />
                </FormSection>

                <FormSection title="Publishing">
                    <div>
                        <Label htmlFor="sort_order">Sort order</Label>
                        <Input id="sort_order" type="number" value={data.sort_order} onChange={(e) => setData('sort_order', Number(e.target.value))} className="mt-1.5" />
                    </div>
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

                <FormActions>
                    <Button type="submit" disabled={processing}>Save Changes</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
