import { Head, router, useForm } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import { ContentLocaleTabs, LocaleBadge } from '@/components/admin/ContentLocaleTabs';
import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { PageHeader } from '@/components/admin/PageHeader';
import { SEO_FIELDS_DEFAULT, SeoFields, SeoFieldsData, seoTranslations } from '@/components/admin/SeoFields';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SlugField } from '@/components/admin/SlugField';
import { usePermissions } from '@/hooks/use-permissions';
import AdminLayout from '@/layouts/AdminLayout';
import { countTranslated, initialTranslations, translatableBinder, translatableError, type ContentLocale, type TranslationValues } from '@/lib/translatable-form';
import { fromDateTimeInput, toDateTimeInput } from '@/lib/datetime-input';
import { FieldHint } from '@/components/admin/FieldHint';
import { fieldHelp } from '@/lib/admin-field-help';

interface Vacancy {
    id: number; title: string; slug: string; department: string | null; location: string | null;
    employment_type: string | null; description: string | null; requirements: string | null;
    status: string; published_at: string | null; closes_at: string | null;
    seo_metadata: {
        meta_title: string | null; meta_description: string | null; canonical_url: string | null;
        og_title: string | null; og_description: string | null; og_image: string | null;
        robots_index: boolean; robots_follow: boolean;
    } | null;
}

const TRANSLATABLE_FIELDS = ['title', 'description', 'requirements'];

export default function Edit({ vacancy, statusOptions }: { vacancy: Vacancy; statusOptions: string[] }) {
    const { can } = usePermissions();

    const { data, setData, post, processing, errors } = useForm<{
        _method: string; slug: string; title: string; department: string; location: string; employment_type: string;
        description: string; requirements: string; status: string; published_at: string; closes_at: string;
        seo: SeoFieldsData;
        translations: { id: TranslationValues };
    }>({
        translations: initialTranslations(vacancy, TRANSLATABLE_FIELDS),
        _method: 'put',
        slug: vacancy.slug,
        title: vacancy.title,
        department: vacancy.department ?? '',
        location: vacancy.location ?? '',
        employment_type: vacancy.employment_type ?? '',
        description: vacancy.description ?? '',
        requirements: vacancy.requirements ?? '',
        status: vacancy.status,
        published_at: vacancy.published_at ?? '',
        closes_at: vacancy.closes_at ?? '',
        seo: {
            ...SEO_FIELDS_DEFAULT,
            translations: seoTranslations(vacancy.seo_metadata),
            meta_title: vacancy.seo_metadata?.meta_title ?? '',
            meta_description: vacancy.seo_metadata?.meta_description ?? '',
            canonical_url: vacancy.seo_metadata?.canonical_url ?? '',
            og_title: vacancy.seo_metadata?.og_title ?? '',
            og_description: vacancy.seo_metadata?.og_description ?? '',
            og_image_path: vacancy.seo_metadata?.og_image ?? '',
            robots_index: vacancy.seo_metadata?.robots_index ?? true,
            robots_follow: vacancy.seo_metadata?.robots_follow ?? true,
        },
    });

    const [contentLocale, setContentLocale] = useState<ContentLocale>('en');
    const bind = translatableBinder(data, setData, contentLocale);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.careers.update', vacancy.id), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${vacancy.title}`} />

            <PageHeader
                title={vacancy.title}
                breadcrumbs={[{ label: 'Job Vacancies', href: route('admin.careers') }, { label: 'Edit' }]}
                actions={
                    <div className="flex items-center gap-2">
                        <StatusBadge status={vacancy.status} />
                        <a href={route('admin.careers.preview', vacancy.id)} target="_blank" rel="noreferrer">
                            <Button variant="secondary" size="sm"><Eye className="mr-2 h-4 w-4" />Preview</Button>
                        </a>
                        {can('careers.manage') && vacancy.status !== 'published' && (
                            <Button size="sm" onClick={() => router.post(route('admin.careers.publish', vacancy.id))}>Publish</Button>
                        )}
                        {can('careers.manage') && vacancy.status !== 'archived' && (
                            <Button variant="secondary" size="sm" onClick={() => router.post(route('admin.careers.archive', vacancy.id))}>Archive</Button>
                        )}
                    </div>
                }
            />

            <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                <ContentLocaleTabs value={contentLocale} onChange={setContentLocale} translated={countTranslated(data.translations.id)} total={TRANSLATABLE_FIELDS.length} />
                <FormSection title="General Information">
                    <div>
                        <Label htmlFor="title">Position<LocaleBadge locale={contentLocale} /></Label>
                        <Input id="title" {...bind('title', fieldHelp('careers', 'title').example)} className="mt-1.5" />
                        {translatableError(errors, 'title', contentLocale) && <p className="mt-1 text-sm text-danger">{translatableError(errors, 'title', contentLocale)}</p>}
                    </div>
                    <SlugField value={data.slug} onChange={(slug) => setData('slug', slug)} source={data.title} prefix="/careers/" hint="Lowercase letters, numbers and hyphens. The page address is the same in both languages; if you change it, links to the old address redirect here automatically." error={errors.slug} />
                    <div>
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" placeholder={fieldHelp('careers', 'department').example} value={data.department} onChange={(e) => setData('department', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" placeholder={fieldHelp('careers', 'location').example} value={data.location} onChange={(e) => setData('location', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor="employment_type">Employment Type</Label>
                        <Input id="employment_type" placeholder={fieldHelp('careers', 'employment_type').example} value={data.employment_type} onChange={(e) => setData('employment_type', e.target.value)} className="mt-1.5" />
                    </div>
                </FormSection>

                <FormSection title="Job Description">
                    <div>
                        <Label htmlFor="description">Description<LocaleBadge locale={contentLocale} /></Label>
                        <textarea id="description" aria-describedby="description-help" {...bind('description')} rows={5} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                        <FieldHint id="description-help">{fieldHelp('careers', 'description').hint}</FieldHint>
                    </div>
                </FormSection>

                <FormSection title="Requirements">
                    <div>
                        <Label htmlFor="requirements">Requirements<LocaleBadge locale={contentLocale} /></Label>
                        <textarea id="requirements" aria-describedby="requirements-help" {...bind('requirements', fieldHelp('careers', 'requirements').example)} rows={5} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                        <FieldHint id="requirements-help">{fieldHelp('careers', 'requirements').hint}</FieldHint>
                    </div>
                </FormSection>

                <FormSection title="Publishing">
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select id="status" aria-describedby="status-help" value={data.status} onChange={(e) => setData('status', e.target.value)} className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm">
                            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <FieldHint id="status-help">{fieldHelp('careers', 'status').hint}</FieldHint>
                    </div>
                    <div>
                        <Label htmlFor="published_at">Published at</Label>
                        <Input id="published_at" aria-describedby="published_at-help" type="datetime-local" value={toDateTimeInput(data.published_at)} onChange={(e) => setData('published_at', fromDateTimeInput(e.target.value))} className="mt-1.5" />
                        <FieldHint id="published_at-help">{fieldHelp('careers', 'published_at').hint}</FieldHint>
                    </div>
                    <div>
                        <Label htmlFor="closes_at">Closing date</Label>
                        <Input id="closes_at" aria-describedby="closes_at-help" type="datetime-local" value={toDateTimeInput(data.closes_at)} onChange={(e) => setData('closes_at', fromDateTimeInput(e.target.value))} className="mt-1.5" />
                        <FieldHint id="closes_at-help">{fieldHelp('careers', 'closes_at').hint}</FieldHint>
                    </div>
                </FormSection>

                <FormSection title="SEO">
                    <SeoFields
                            locale={contentLocale}
                        data={data.seo}
                        onChange={(patch) => setData('seo', { ...data.seo, ...patch })}
                        errors={errors}
                        titleFallback={vacancy.title}
                        pageUrl={`/careers/${vacancy.slug}`}
                    />
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={processing}>Save Changes</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
