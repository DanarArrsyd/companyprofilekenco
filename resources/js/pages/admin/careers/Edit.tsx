import { Head, router, useForm } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { FormEventHandler } from 'react';

import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { PageHeader } from '@/components/admin/PageHeader';
import { SEO_FIELDS_DEFAULT, SeoFields, SeoFieldsData } from '@/components/admin/SeoFields';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePermissions } from '@/hooks/use-permissions';
import AdminLayout from '@/layouts/AdminLayout';

interface Vacancy {
    id: number; title: string; slug: string; department: string | null; location: string | null;
    employment_type: string | null; description: string | null; requirements: string | null;
    status: string; published_at: string | null; closes_at: string | null;
    seoMetadata: {
        meta_title: string | null; meta_description: string | null; canonical_url: string | null;
        og_title: string | null; og_description: string | null; og_image: string | null;
        robots_index: boolean; robots_follow: boolean;
    } | null;
}

export default function Edit({ vacancy, statusOptions }: { vacancy: Vacancy; statusOptions: string[] }) {
    const { can } = usePermissions();

    const { data, setData, post, processing, errors } = useForm<{
        _method: string; title: string; department: string; location: string; employment_type: string;
        description: string; requirements: string; status: string; published_at: string; closes_at: string;
        seo: SeoFieldsData;
    }>({
        _method: 'put',
        title: vacancy.title,
        department: vacancy.department ?? '',
        location: vacancy.location ?? '',
        employment_type: vacancy.employment_type ?? '',
        description: vacancy.description ?? '',
        requirements: vacancy.requirements ?? '',
        status: vacancy.status,
        published_at: vacancy.published_at ? vacancy.published_at.slice(0, 16) : '',
        closes_at: vacancy.closes_at ? vacancy.closes_at.slice(0, 16) : '',
        seo: {
            ...SEO_FIELDS_DEFAULT,
            meta_title: vacancy.seoMetadata?.meta_title ?? '',
            meta_description: vacancy.seoMetadata?.meta_description ?? '',
            canonical_url: vacancy.seoMetadata?.canonical_url ?? '',
            og_title: vacancy.seoMetadata?.og_title ?? '',
            og_description: vacancy.seoMetadata?.og_description ?? '',
            og_image_path: vacancy.seoMetadata?.og_image ?? '',
            robots_index: vacancy.seoMetadata?.robots_index ?? true,
            robots_follow: vacancy.seoMetadata?.robots_follow ?? true,
        },
    });

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

            <form onSubmit={submit} className="rounded border border-border bg-surface px-6">
                <FormSection title="General Information">
                    <div>
                        <Label htmlFor="title">Position</Label>
                        <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} className="mt-1.5" />
                        {errors.title && <p className="mt-1 text-sm text-danger">{errors.title}</p>}
                    </div>
                    <div>
                        <Label>Slug</Label>
                        <p className="mt-1.5 rounded border border-border bg-muted px-3 py-2 text-sm text-slate-600">/careers/{vacancy.slug}</p>
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
                        <Input id="employment_type" value={data.employment_type} onChange={(e) => setData('employment_type', e.target.value)} className="mt-1.5" />
                    </div>
                </FormSection>

                <FormSection title="Job Description">
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={5} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                </FormSection>

                <FormSection title="Requirements">
                    <div>
                        <Label htmlFor="requirements">Requirements</Label>
                        <textarea id="requirements" value={data.requirements} onChange={(e) => setData('requirements', e.target.value)} rows={5} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
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
