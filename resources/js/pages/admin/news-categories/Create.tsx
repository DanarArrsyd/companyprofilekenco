import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import { ContentLocaleTabs, LocaleBadge } from '@/components/admin/ContentLocaleTabs';
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

const TRANSLATABLE_FIELDS = ['name', 'description'];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        translations: initialTranslations(null, TRANSLATABLE_FIELDS),
        name: '',
        slug: '',
        description: '',
    });

    const [contentLocale, setContentLocale] = useState<ContentLocale>('en');
    const bind = translatableBinder(data, setData, contentLocale);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.news.categories.store'));
    };

    return (
        <AdminLayout>
            <Head title="New News Category" />
            <PageHeader
                title="New News Category"
                breadcrumbs={[{ label: 'Categories', href: route('admin.news.categories') }, { label: 'New' }]}
            />

            <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                <ContentLocaleTabs value={contentLocale} onChange={setContentLocale} translated={countTranslated(data.translations.id)} total={TRANSLATABLE_FIELDS.length} />
                <FormSection title="General">
                    <div>
                        <Label htmlFor="name">Name<LocaleBadge locale={contentLocale} /></Label>
                        <Input id="name" {...bind('name', fieldHelp('news-categories', 'name').example)} className="mt-1.5" autoFocus />
                        {translatableError(errors, 'name', contentLocale) && <p className="mt-1 text-sm text-danger">{translatableError(errors, 'name', contentLocale)}</p>}
                    </div>
                    <div>
                        <Label htmlFor="slug">Slug (optional)</Label>
                        <Input id="slug" aria-describedby="slug-help" value={data.slug} onChange={(e) => setData('slug', e.target.value)} className="mt-1.5" placeholder="Auto-generated from name" />
                        <FieldHint id="slug-help">{fieldHelp('news-categories', 'slug').hint}</FieldHint>
                        {errors.slug && <p className="mt-1 text-sm text-danger">{errors.slug}</p>}
                    </div>
                    <div>
                        <Label htmlFor="description">Description<LocaleBadge locale={contentLocale} /></Label>
                        <textarea id="description" {...bind('description')} rows={3} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={processing}>Create Category</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
