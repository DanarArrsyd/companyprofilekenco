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

const TRANSLATABLE_FIELDS = ['title', 'description'];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm<{
        year: number;
        title: string;
        description: string;
        image: File | null;
        image_path: string;
        order: number;
        translations: { id: TranslationValues };
    }>({
        translations: initialTranslations(null, TRANSLATABLE_FIELDS),
        year: new Date().getFullYear(),
        title: '',
        description: '',
        image: null,
        image_path: '',
        order: 0,
    });

    const [contentLocale, setContentLocale] = useState<ContentLocale>('en');
    const bind = translatableBinder(data, setData, contentLocale);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.milestones.store'), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title="New Milestone" />
            <PageHeader title="New Milestone" breadcrumbs={[{ label: 'Milestones', href: route('admin.milestones') }, { label: 'New' }]} />

            <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                <ContentLocaleTabs value={contentLocale} onChange={setContentLocale} translated={countTranslated(data.translations.id)} total={TRANSLATABLE_FIELDS.length} />
                <FormSection title="General">
                    <div>
                        <Label htmlFor="year">Year</Label>
                        <Input id="year" aria-describedby="year-help" type="number" value={data.year} onChange={(e) => setData('year', Number(e.target.value))} className="mt-1.5" autoFocus />
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
                        currentUrl={data.image ? URL.createObjectURL(data.image) : (data.image_path ? `/storage/${data.image_path}` : null)}
                        onUploadFile={(file) => { setData('image', file); setData('image_path', ''); }}
                        onSelectPath={(path) => { setData('image_path', path); setData('image', null); }}
                        onClear={() => { setData('image', null); setData('image_path', ''); }}
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
                    <Button type="submit" disabled={processing}>Create Milestone</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
