import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { PageHeader } from '@/components/admin/PageHeader';
import { SEO_FIELDS_DEFAULT, SeoFields, SeoFieldsData } from '@/components/admin/SeoFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';

export default function Create({ statusOptions }: { statusOptions: string[] }) {
    const { data, setData, post, processing, errors } = useForm<{
        title: string; slug: string; status: string; published_at: string; seo: SeoFieldsData;
    }>({
        title: '',
        slug: '',
        status: 'draft',
        published_at: '',
        seo: SEO_FIELDS_DEFAULT,
    });

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

            <form onSubmit={submit} className="rounded border border-border bg-surface px-6">
                <FormSection title="General" description="Basic identity for this page.">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1.5"
                            autoFocus
                        />
                        {errors.title && <p className="mt-1 text-sm text-danger">{errors.title}</p>}
                    </div>

                    <div>
                        <Label htmlFor="slug">Slug (optional)</Label>
                        <Input
                            id="slug"
                            value={data.slug}
                            onChange={(e) => setData('slug', e.target.value)}
                            className="mt-1.5"
                            placeholder="Auto-generated from title if left blank"
                        />
                        {errors.slug && <p className="mt-1 text-sm text-danger">{errors.slug}</p>}
                    </div>
                </FormSection>

                <FormSection title="Publishing" description="Control visibility of this page.">
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
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
                    </div>

                    <div>
                        <Label htmlFor="published_at">Published at</Label>
                        <Input
                            id="published_at"
                            type="datetime-local"
                            value={data.published_at}
                            onChange={(e) => setData('published_at', e.target.value)}
                            className="mt-1.5"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            Leave blank to publish immediately when status is set to Published.
                        </p>
                    </div>
                </FormSection>

                <FormSection title="SEO" description="Search engine and social sharing metadata.">
                    <SeoFields
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
