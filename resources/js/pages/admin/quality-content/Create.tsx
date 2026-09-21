import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { MediaPickerField } from '@/components/admin/MediaPicker';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';
import { mediaUrl } from '@/lib/media';

export default function Create({ statusOptions }: { statusOptions: string[] }) {
    const { data, setData, post, processing, errors } = useForm<{
        title: string; slug: string; summary: string; content: string; image: File | null; image_path: string;
        sort_order: number; status: string; published_at: string;
    }>({
        title: '', slug: '', summary: '', content: '', image: null, image_path: '',
        sort_order: 0, status: 'draft', published_at: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.quality-content.store'), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title="New Quality Content" />
            <PageHeader title="New Quality Content" breadcrumbs={[{ label: 'Quality Content', href: route('admin.quality-content') }, { label: 'New' }]} />

            <form onSubmit={submit} className="rounded border border-border bg-surface px-6">
                <FormSection title="General">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} className="mt-1.5" autoFocus />
                        {errors.title && <p className="mt-1 text-sm text-danger">{errors.title}</p>}
                    </div>
                    <div>
                        <Label htmlFor="slug">Slug (optional)</Label>
                        <Input id="slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor="summary">Summary</Label>
                        <Input id="summary" value={data.summary} onChange={(e) => setData('summary', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor="content">Content</Label>
                        <textarea id="content" value={data.content} onChange={(e) => setData('content', e.target.value)} rows={5} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
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
                    <Button type="submit" disabled={processing}>Create Content</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
