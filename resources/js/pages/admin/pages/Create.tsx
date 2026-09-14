import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';

export default function Create({ statusOptions }: { statusOptions: string[] }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        slug: '',
        status: 'draft',
        published_at: '',
        seo: {
            meta_title: '',
            meta_description: '',
            canonical_url: '',
            og_title: '',
            og_description: '',
            og_image: '',
            robots_index: true as boolean,
            robots_follow: true as boolean,
        },
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.pages.store'));
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
                    <div>
                        <Label htmlFor="meta_title">Meta title</Label>
                        <Input
                            id="meta_title"
                            value={data.seo.meta_title}
                            onChange={(e) => setData('seo', { ...data.seo, meta_title: e.target.value })}
                            className="mt-1.5"
                        />
                    </div>
                    <div>
                        <Label htmlFor="meta_description">Meta description</Label>
                        <textarea
                            id="meta_description"
                            value={data.seo.meta_description}
                            onChange={(e) => setData('seo', { ...data.seo, meta_description: e.target.value })}
                            rows={3}
                            className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <Label htmlFor="canonical_url">Canonical URL</Label>
                        <Input
                            id="canonical_url"
                            value={data.seo.canonical_url}
                            onChange={(e) => setData('seo', { ...data.seo, canonical_url: e.target.value })}
                            className="mt-1.5"
                        />
                    </div>
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
