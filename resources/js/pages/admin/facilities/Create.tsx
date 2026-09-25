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
import { fromDateTimeInput, toDateTimeInput } from '@/lib/datetime-input';
import { FieldHint } from '@/components/admin/FieldHint';
import { fieldHelp } from '@/lib/admin-field-help';

const TRANSLATABLE_FIELDS = ['name', 'description'];

export default function Create({ categories, statusOptions }: { categories: { id: number; name: string }[]; statusOptions: string[] }) {
    const { data, setData, post, processing, errors } = useForm<{
        facility_category_id: string; name: string; slug: string; location: string; description: string;
        image: File | null; image_path: string; sort_order: number; status: string; published_at: string;
        translations: { id: TranslationValues };
    }>({
        translations: initialTranslations(null, TRANSLATABLE_FIELDS),
        facility_category_id: '', name: '', slug: '', location: '', description: '',
        image: null, image_path: '', sort_order: 0, status: 'draft', published_at: '',
    });

    const [contentLocale, setContentLocale] = useState<ContentLocale>('en');
    const bind = translatableBinder(data, setData, contentLocale);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.facilities.store'), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title="New Facility" />
            <PageHeader title="New Facility" breadcrumbs={[{ label: 'Facilities', href: route('admin.facilities') }, { label: 'New' }]} />

            <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                <ContentLocaleTabs value={contentLocale} onChange={setContentLocale} translated={countTranslated(data.translations.id)} total={TRANSLATABLE_FIELDS.length} />
                <FormSection title="General">
                    <div>
                        <Label htmlFor="name">Name<LocaleBadge locale={contentLocale} /></Label>
                        <Input id="name" {...bind('name', fieldHelp('facilities', 'name').example)} className="mt-1.5" autoFocus />
                        {translatableError(errors, 'name', contentLocale) && <p className="mt-1 text-sm text-danger">{translatableError(errors, 'name', contentLocale)}</p>}
                    </div>
                    <div>
                        <Label htmlFor="slug">Slug (optional)</Label>
                        <Input id="slug" aria-describedby="slug-help" placeholder={fieldHelp('facilities', 'slug').example} value={data.slug} onChange={(e) => setData('slug', e.target.value)} className="mt-1.5" />
                        <FieldHint id="slug-help">{fieldHelp('facilities', 'slug').hint}</FieldHint>
                    </div>
                    <div>
                        <Label htmlFor="facility_category_id">Category</Label>
                        <select id="facility_category_id" aria-describedby="facility_category_id-help" value={data.facility_category_id} onChange={(e) => setData('facility_category_id', e.target.value)} className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm">
                            <option value="">No category</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <FieldHint id="facility_category_id-help">{fieldHelp('facilities', 'facility_category_id').hint}</FieldHint>
                    </div>
                    <div>
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" placeholder={fieldHelp('facilities', 'location').example} value={data.location} onChange={(e) => setData('location', e.target.value)} className="mt-1.5" />
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
                        <Input id="sort_order" aria-describedby="sort_order-help" type="number" value={data.sort_order} onChange={(e) => setData('sort_order', Number(e.target.value))} className="mt-1.5" />
                        <FieldHint id="sort_order-help">{fieldHelp('facilities', 'sort_order').hint}</FieldHint>
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select id="status" aria-describedby="status-help" value={data.status} onChange={(e) => setData('status', e.target.value)} className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm">
                            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <FieldHint id="status-help">{fieldHelp('facilities', 'status').hint}</FieldHint>
                    </div>
                    <div>
                        <Label htmlFor="published_at">Published at</Label>
                        <Input id="published_at" aria-describedby="published_at-help" type="datetime-local" value={toDateTimeInput(data.published_at)} onChange={(e) => setData('published_at', fromDateTimeInput(e.target.value))} className="mt-1.5" />
                        <FieldHint id="published_at-help">{fieldHelp('facilities', 'published_at').hint}</FieldHint>
                    </div>
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={processing}>Create Facility</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
