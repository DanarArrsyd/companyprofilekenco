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

const TRANSLATABLE_FIELDS = ['name', 'description'];

export default function Create({ statusOptions }: { statusOptions: string[] }) {
    const { data, setData, post, processing, errors } = useForm({
        translations: initialTranslations(null, TRANSLATABLE_FIELDS),
        name: '',
        slug: '',
        description: '',
        sort_order: 0,
        status: 'published',
    });

    const [contentLocale, setContentLocale] = useState<ContentLocale>('en');
    const bind = translatableBinder(data, setData, contentLocale);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.facilities.categories.store'));
    };

    return (
        <AdminLayout>
            <Head title="New Facility Category" />
            <PageHeader
                title="New Facility Category"
                breadcrumbs={[{ label: 'Categories', href: route('admin.facilities.categories') }, { label: 'New' }]}
            />

            <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                <ContentLocaleTabs value={contentLocale} onChange={setContentLocale} translated={countTranslated(data.translations.id)} total={TRANSLATABLE_FIELDS.length} />
                <FormSection title="General">
                    <div>
                        <Label htmlFor="name">Name<LocaleBadge locale={contentLocale} /></Label>
                        <Input id="name" {...bind('name')} className="mt-1.5" autoFocus />
                        {translatableError(errors, 'name', contentLocale) && <p className="mt-1 text-sm text-danger">{translatableError(errors, 'name', contentLocale)}</p>}
                    </div>
                    <div>
                        <Label htmlFor="slug">Slug (optional)</Label>
                        <Input id="slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} className="mt-1.5" placeholder="Auto-generated from name" />
                        {errors.slug && <p className="mt-1 text-sm text-danger">{errors.slug}</p>}
                    </div>
                    <div>
                        <Label htmlFor="description">Description<LocaleBadge locale={contentLocale} /></Label>
                        <textarea id="description" {...bind('description')} rows={3} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                </FormSection>

                <FormSection title="Display" description="Ordering and visibility.">
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
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={processing}>Create Category</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
