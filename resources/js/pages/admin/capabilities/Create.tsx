import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { MediaPickerField } from '@/components/admin/MediaPicker';
import { PageHeader } from '@/components/admin/PageHeader';
import { SEO_FIELDS_DEFAULT, SeoFields, SeoFieldsData } from '@/components/admin/SeoFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';

export default function Create({ statusOptions }: { statusOptions: string[] }) {
    const { data, setData, post, processing, errors } = useForm<{
        name: string; slug: string; summary: string; description: string; icon: string;
        featured_image: File | null; featured_image_path: string; is_featured: boolean; sort_order: number;
        status: string; published_at: string;
        seo: SeoFieldsData;
    }>({
        name: '', slug: '', summary: '', description: '', icon: '',
        featured_image: null, featured_image_path: '', is_featured: false, sort_order: 0,
        status: 'draft', published_at: '',
        seo: SEO_FIELDS_DEFAULT,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.capabilities.store'), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title="New Capability" />
            <PageHeader title="New Capability" breadcrumbs={[{ label: 'Capabilities', href: route('admin.capabilities') }, { label: 'New' }]} />

            <form onSubmit={submit} className="rounded border border-border bg-surface px-6">
                <FormSection title="General">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1.5" autoFocus />
                        {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
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
                        <Label htmlFor="description">Description</Label>
                        <textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={5} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <Label htmlFor="icon">Icon (lucide icon name, optional)</Label>
                        <Input id="icon" value={data.icon} onChange={(e) => setData('icon', e.target.value)} className="mt-1.5" placeholder="e.g. Wrench" />
                    </div>
                </FormSection>

                <FormSection title="Media">
                    <MediaPickerField
                        label="Featured Image"
                        currentUrl={data.featured_image ? URL.createObjectURL(data.featured_image) : (data.featured_image_path ? `/storage/${data.featured_image_path}` : null)}
                        onUploadFile={(file) => { setData('featured_image', file); setData('featured_image_path', ''); }}
                        onSelectPath={(path) => { setData('featured_image_path', path); setData('featured_image', null); }}
                        onClear={() => { setData('featured_image', null); setData('featured_image_path', ''); }}
                    />
                </FormSection>

                <FormSection title="Publishing">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)} className="rounded border-border" />
                        Featured capability
                    </label>
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

                <FormSection title="SEO">
                    <SeoFields
                        data={data.seo}
                        onChange={(patch) => setData('seo', { ...data.seo, ...patch })}
                        errors={errors}
                        titleFallback={data.name || 'New Capability'}
                        pageUrl={`/capabilities/${data.slug || '...'}`}
                    />
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={processing}>Create Capability</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
