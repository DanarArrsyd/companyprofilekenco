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

const TRANSLATABLE_FIELDS = ['title', 'description', 'requirements'];

export default function Create({ statusOptions }: { statusOptions: string[] }) {
    const { data, setData, post, processing, errors } = useForm<{
        title: string; slug: string; department: string; location: string; employment_type: string;
        description: string; requirements: string; status: string; published_at: string; closes_at: string;
        seo: SeoFieldsData;
        translations: { id: TranslationValues };
    }>({
        translations: initialTranslations(null, TRANSLATABLE_FIELDS),
        title: '',
        slug: '',
        department: '',
        location: '',
        employment_type: '',
        description: '',
        requirements: '',
        status: 'draft',
        published_at: '',
        closes_at: '',
        seo: SEO_FIELDS_DEFAULT,
    });

    const [contentLocale, setContentLocale] = useState<ContentLocale>('en');
    const bind = translatableBinder(data, setData, contentLocale);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.careers.store'), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title="New Job Vacancy" />
            <PageHeader title="New Job Vacancy" breadcrumbs={[{ label: 'Job Vacancies', href: route('admin.careers') }, { label: 'New' }]} />

            <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                <ContentLocaleTabs value={contentLocale} onChange={setContentLocale} translated={countTranslated(data.translations.id)} total={TRANSLATABLE_FIELDS.length} />
                <FormSection title="General Information">
                    <div>
                        <Label htmlFor="title">Position<LocaleBadge locale={contentLocale} /></Label>
                        <Input id="title" {...bind('title')} className="mt-1.5" autoFocus />
                        {translatableError(errors, 'title', contentLocale) && <p className="mt-1 text-sm text-danger">{translatableError(errors, 'title', contentLocale)}</p>}
                    </div>
                    <div>
                        <Label htmlFor="slug">Slug (optional)</Label>
                        <Input id="slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} className="mt-1.5" placeholder="Auto-generated from position" />
                        {errors.slug && <p className="mt-1 text-sm text-danger">{errors.slug}</p>}
                    </div>
                    <div>
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" value={data.department} onChange={(e) => setData('department', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" value={data.location} onChange={(e) => setData('location', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor="employment_type">Employment Type</Label>
                        <Input id="employment_type" value={data.employment_type} onChange={(e) => setData('employment_type', e.target.value)} className="mt-1.5" placeholder="full-time, contract, internship" />
                    </div>
                </FormSection>

                <FormSection title="Job Description">
                    <div>
                        <Label htmlFor="description">Description<LocaleBadge locale={contentLocale} /></Label>
                        <textarea id="description" {...bind('description')} rows={5} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                </FormSection>

                <FormSection title="Requirements">
                    <div>
                        <Label htmlFor="requirements">Requirements<LocaleBadge locale={contentLocale} /></Label>
                        <textarea id="requirements" {...bind('requirements')} rows={5} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                </FormSection>

                <FormSection title="Publishing">
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
                    <div>
                        <Label htmlFor="closes_at">Closing date</Label>
                        <Input id="closes_at" type="datetime-local" value={data.closes_at} onChange={(e) => setData('closes_at', e.target.value)} className="mt-1.5" />
                    </div>
                </FormSection>

                <FormSection title="SEO">
                    <SeoFields
                            locale={contentLocale}
                        data={data.seo}
                        onChange={(patch) => setData('seo', { ...data.seo, ...patch })}
                        errors={errors}
                        titleFallback={data.title || 'New Job Vacancy'}
                        pageUrl={`/careers/${data.slug || '...'}`}
                    />
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={processing}>Create Vacancy</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
