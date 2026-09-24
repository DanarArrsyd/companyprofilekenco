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

interface Item {
    id: number; title: string; slug: string; summary: string | null; content: string | null;
    image: string | null; sort_order: number; status: string; published_at: string | null;
}

const TRANSLATABLE_FIELDS = ['title', 'summary', 'content'];

export default function Edit({ item, statusOptions }: { item: Item; statusOptions: string[] }) {
    const { data, setData, post, processing, errors } = useForm<{
        _method: string; title: string; summary: string; content: string; image: File | null; image_path: string;
        sort_order: number; status: string; published_at: string;
        translations: { id: TranslationValues };
    }>({
        translations: initialTranslations(item, TRANSLATABLE_FIELDS),
        _method: 'put',
        title: item.title,
        summary: item.summary ?? '',
        content: item.content ?? '',
        image: null,
        image_path: item.image ?? '',
        sort_order: item.sort_order,
        status: item.status,
        published_at: item.published_at ? item.published_at.slice(0, 16) : '',
    });

    const [contentLocale, setContentLocale] = useState<ContentLocale>('en');
    const bind = translatableBinder(data, setData, contentLocale);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.quality-content.update', item.id), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${item.title}`} />
            <PageHeader title={item.title} breadcrumbs={[{ label: 'Quality Content', href: route('admin.quality-content') }, { label: 'Edit' }]} />

            <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                <ContentLocaleTabs value={contentLocale} onChange={setContentLocale} translated={countTranslated(data.translations.id)} total={TRANSLATABLE_FIELDS.length} />
                <FormSection title="General">
                    <div>
                        <Label htmlFor="title">Title<LocaleBadge locale={contentLocale} /></Label>
                        <Input id="title" {...bind('title')} className="mt-1.5" />
                        {translatableError(errors, 'title', contentLocale) && <p className="mt-1 text-sm text-danger">{translatableError(errors, 'title', contentLocale)}</p>}
                    </div>
                    <div>
                        <Label>Slug</Label>
                        <p className="mt-1.5 rounded border border-border bg-muted px-3 py-2 text-sm text-slate-600">/{item.slug}</p>
                    </div>
                    <div>
                        <Label htmlFor="summary">Summary<LocaleBadge locale={contentLocale} /></Label>
                        <Input id="summary" {...bind('summary')} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor="content">Content<LocaleBadge locale={contentLocale} /></Label>
                        <textarea id="content" {...bind('content')} rows={5} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                </FormSection>

                <FormSection title="Media">
                    <MediaPickerField
                        label="Quality Image"
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
