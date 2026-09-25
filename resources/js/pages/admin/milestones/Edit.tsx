import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import { ContentLocaleTabs, LocaleBadge } from '@/components/admin/ContentLocaleTabs';
import { MediaPickerField } from '@/components/admin/MediaPicker';
import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';
import { countTranslated, initialTranslations, translatableBinder, translatableError, type ContentLocale, type TranslationValues } from '@/lib/translatable-form';
import { FieldHint } from '@/components/admin/FieldHint';
import { fieldHelp } from '@/lib/admin-field-help';

interface MilestoneRecord {
    id: number;
    year: number;
    title: string;
    description: string | null;
    image: string | null;
    order: number;
}

const TRANSLATABLE_FIELDS = ['title', 'description'];

export default function Edit({ milestone }: { milestone: MilestoneRecord }) {
    const { data, setData, post, processing, errors } = useForm<{
        _method: string;
        year: number;
        title: string;
        description: string;
        image: File | null;
        image_path: string;
        remove_image: boolean;
        order: number;
        translations: { id: TranslationValues };
    }>({
        translations: initialTranslations(milestone, TRANSLATABLE_FIELDS),
        _method: 'put',
        year: milestone.year,
        title: milestone.title,
        description: milestone.description ?? '',
        image: null,
        image_path: '',
        remove_image: false,
        order: milestone.order,
    });

    const [contentLocale, setContentLocale] = useState<ContentLocale>('en');
    const bind = translatableBinder(data, setData, contentLocale);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.milestones.update', milestone.id), { forceFormData: true });
    };

    const existingUrl = milestone.image ? `/storage/${milestone.image}` : null;
    const currentUrl = data.image
        ? URL.createObjectURL(data.image)
        : data.image_path
            ? `/storage/${data.image_path}`
            : (data.remove_image ? null : existingUrl);

    return (
        <AdminLayout>
            <Head title={`Edit ${milestone.title}`} />
            <PageHeader title={milestone.title} breadcrumbs={[{ label: 'Milestones', href: route('admin.milestones') }, { label: 'Edit' }]} />

            <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                <ContentLocaleTabs value={contentLocale} onChange={setContentLocale} translated={countTranslated(data.translations.id)} total={TRANSLATABLE_FIELDS.length} />
                <FormSection title="General">
                    <div>
                        <Label htmlFor="year">Year</Label>
                        <Input id="year" aria-describedby="year-help" type="number" value={data.year} onChange={(e) => setData('year', Number(e.target.value))} className="mt-1.5" />
                        <FieldHint id="year-help">{fieldHelp('milestones', 'year').hint}</FieldHint>
                        {errors.year && <p className="mt-1 text-sm text-danger">{errors.year}</p>}
                    </div>
                    <div>
                        <Label htmlFor="title">Title<LocaleBadge locale={contentLocale} /></Label>
                        <Input id="title" {...bind('title', fieldHelp('milestones', 'title').example)} className="mt-1.5" />
                        {translatableError(errors, 'title', contentLocale) && <p className="mt-1 text-sm text-danger">{translatableError(errors, 'title', contentLocale)}</p>}
                    </div>
                    <div>
                        <Label htmlFor="description">Description<LocaleBadge locale={contentLocale} /></Label>
                        <textarea id="description" {...bind('description')} rows={3} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                </FormSection>

                <FormSection title="Media">
                    <MediaPickerField
                        label="Image"
                        currentUrl={currentUrl}
                        onUploadFile={(file) => { setData('image', file); setData('image_path', ''); setData('remove_image', false); }}
                        onSelectPath={(path) => { setData('image_path', path); setData('image', null); setData('remove_image', false); }}
                        onClear={() => { setData('image', null); setData('image_path', ''); setData('remove_image', true); }}
                        error={errors.image}
                    />
                </FormSection>

                <FormSection title="Ordering">
                    <div>
                        <Label htmlFor="order">Sort order</Label>
                        <Input id="order" aria-describedby="order-help" type="number" value={data.order} onChange={(e) => setData('order', Number(e.target.value))} className="mt-1.5" />
                        <FieldHint id="order-help">{fieldHelp('milestones', 'order').hint}</FieldHint>
                    </div>
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={processing}>Save Changes</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
