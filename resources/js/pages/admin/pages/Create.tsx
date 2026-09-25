import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import { ContentLocaleTabs, LocaleBadge } from '@/components/admin/ContentLocaleTabs';
import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
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

const TRANSLATABLE_FIELDS = ['title'];

export default function Create({ statusOptions }: { statusOptions: string[] }) {
    const { data, setData, post, processing, errors } = useForm<{
        title: string; slug: string; status: string; published_at: string; seo: SeoFieldsData;
        translations: { id: TranslationValues };
    }>({
        translations: initialTranslations(null, TRANSLATABLE_FIELDS),
        title: '',
        slug: '',
        status: 'draft',
        published_at: '',
        seo: SEO_FIELDS_DEFAULT,
    });

    const [contentLocale, setContentLocale] = useState<ContentLocale>('en');
    const bind = translatableBinder(data, setData, contentLocale);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.pages.store'), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title="New Page" />

            <PageHeader
                title="New Page"
                breadcrumbs={[{ label: 'Pages', href: route('admin.pages') }, { label: 'New' }]}
            />

            <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                <ContentLocaleTabs value={contentLocale} onChange={setContentLocale} translated={countTranslated(data.translations.id)} total={TRANSLATABLE_FIELDS.length} />
                <FormSection title="General" description="Basic identity for this page.">
                    <div>
                        <Label htmlFor="title">Title<LocaleBadge locale={contentLocale} /></Label>
                        <Input
                            id="title"
                            {...bind('title', fieldHelp('pages', 'title').example)}
                            className="mt-1.5"
                            autoFocus
                        />
                        {translatableError(errors, 'title', contentLocale) && <p className="mt-1 text-sm text-danger">{translatableError(errors, 'title', contentLocale)}</p>}
                    </div>

                    <div>
                        <Label htmlFor="slug">Slug (optional)</Label>
                        <Input
                            id="slug" aria-describedby="slug-help"
                            value={data.slug}
                            onChange={(e) => setData('slug', e.target.value)}
                            className="mt-1.5"
                            placeholder="Auto-generated from title if left blank"
                        />
                        <FieldHint id="slug-help">{fieldHelp('pages', 'slug').hint}</FieldHint>
                        {errors.slug && <p className="mt-1 text-sm text-danger">{errors.slug}</p>}
                    </div>
                </FormSection>

                <FormSection title="Publishing" description="Control visibility of this page.">
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status" aria-describedby="status-help"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm"
                        >
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                        <FieldHint id="status-help">{fieldHelp('pages', 'status').hint}</FieldHint>
                    </div>

                    <div>
                        <Label htmlFor="published_at">Published at</Label>
                        <Input
                            id="published_at" aria-describedby="published_at-help"
                            type="datetime-local"
                            value={toDateTimeInput(data.published_at)}
                            onChange={(e) => setData('published_at', fromDateTimeInput(e.target.value))}
                            className="mt-1.5"
                        />
                        <FieldHint id="published_at-help">{fieldHelp('pages', 'published_at').hint}</FieldHint>
                        <p className="mt-1 text-xs text-slate-500">
                            Leave blank to publish immediately when status is set to Published.
                        </p>
                    </div>
                </FormSection>

                <FormSection title="SEO" description="Search engine and social sharing metadata.">
                    <SeoFields
                            locale={contentLocale}
                        data={data.seo}
                        onChange={(patch) => setData('seo', { ...data.seo, ...patch })}
                        errors={errors}
                        titleFallback={data.title || 'New Page'}
                        pageUrl={`/${data.slug || '...'}`}
                    />
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={processing}>
                        Create Page
                    </Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
