import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import { ContentLocaleTabs, LocaleBadge } from '@/components/admin/ContentLocaleTabs';
import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SlugField } from '@/components/admin/SlugField';
import AdminLayout from '@/layouts/AdminLayout';
import { countTranslated, initialTranslations, translatableBinder, translatableError, type ContentLocale, type TranslationValues } from '@/lib/translatable-form';
import { fieldHelp } from '@/lib/admin-field-help';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
}

const TRANSLATABLE_FIELDS = ['name', 'description'];

export default function Edit({ category }: { category: Category }) {
    const { data, setData, put, processing, errors } = useForm({
        translations: initialTranslations(category, TRANSLATABLE_FIELDS),
        name: category.name,
        slug: category.slug,
        description: category.description ?? '',
    });

    const [contentLocale, setContentLocale] = useState<ContentLocale>('en');
    const bind = translatableBinder(data, setData, contentLocale);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.news.categories.update', category.id));
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${category.name}`} />
            <PageHeader title={category.name} breadcrumbs={[{ label: 'Categories', href: route('admin.news.categories') }, { label: 'Edit' }]} />

            <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                <ContentLocaleTabs value={contentLocale} onChange={setContentLocale} translated={countTranslated(data.translations.id)} total={TRANSLATABLE_FIELDS.length} />
                <FormSection title="General">
                    <div>
                        <Label htmlFor="name">Name<LocaleBadge locale={contentLocale} /></Label>
                        <Input id="name" {...bind('name', fieldHelp('news-categories', 'name').example)} className="mt-1.5" />
                        {translatableError(errors, 'name', contentLocale) && <p className="mt-1 text-sm text-danger">{translatableError(errors, 'name', contentLocale)}</p>}
                    </div>
                    <SlugField value={data.slug} onChange={(slug) => setData('slug', slug)} source={data.name} hint="Lowercase letters, numbers and hyphens. Used in the category filter link (?category=…); old filter links show all items after a change." error={errors.slug} />
                    <div>
                        <Label htmlFor="description">Description<LocaleBadge locale={contentLocale} /></Label>
                        <textarea id="description" {...bind('description')} rows={3} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={processing}>Save Changes</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
