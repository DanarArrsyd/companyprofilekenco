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

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    sort_order: number;
    status: string;
}

const TRANSLATABLE_FIELDS = ['name', 'description'];

export default function Edit({ category, statusOptions }: { category: Category; statusOptions: string[] }) {
    const { data, setData, put, processing, errors } = useForm({
        translations: initialTranslations(category, TRANSLATABLE_FIELDS),
        name: category.name,
        description: category.description ?? '',
        sort_order: category.sort_order,
        status: category.status,
    });

    const [contentLocale, setContentLocale] = useState<ContentLocale>('en');
    const bind = translatableBinder(data, setData, contentLocale);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.products.categories.update', category.id));
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${category.name}`} />
            <PageHeader
                title={category.name}
                breadcrumbs={[{ label: 'Categories', href: route('admin.products.categories') }, { label: 'Edit' }]}
            />

            <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                <ContentLocaleTabs value={contentLocale} onChange={setContentLocale} translated={countTranslated(data.translations.id)} total={TRANSLATABLE_FIELDS.length} />
                <FormSection title="General">
                    <div>
                        <Label htmlFor="name">Name<LocaleBadge locale={contentLocale} /></Label>
                        <Input id="name" {...bind('name', fieldHelp('product-categories', 'name').example)} className="mt-1.5" />
                        {translatableError(errors, 'name', contentLocale) && <p className="mt-1 text-sm text-danger">{translatableError(errors, 'name', contentLocale)}</p>}
                    </div>
                    <div>
                        <Label>Slug</Label>
                        <p className="mt-1.5 rounded border border-border bg-muted px-3 py-2 text-sm text-slate-700">/{category.slug}</p>
                    </div>
                    <div>
                        <Label htmlFor="description">Description<LocaleBadge locale={contentLocale} /></Label>
                        <textarea id="description" {...bind('description')} rows={3} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                </FormSection>

                <FormSection title="Display">
                    <div>
                        <Label htmlFor="sort_order">Sort order</Label>
                        <Input id="sort_order" aria-describedby="sort_order-help" type="number" value={data.sort_order} onChange={(e) => setData('sort_order', Number(e.target.value))} className="mt-1.5" />
                        <FieldHint id="sort_order-help">{fieldHelp('product-categories', 'sort_order').hint}</FieldHint>
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select id="status" aria-describedby="status-help" value={data.status} onChange={(e) => setData('status', e.target.value)} className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm">
                            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <FieldHint id="status-help">{fieldHelp('product-categories', 'status').hint}</FieldHint>
                    </div>
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={processing}>Save Changes</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
