import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';

export default function Create({ categories, statusOptions }: { categories: { id: number; name: string }[]; statusOptions: string[] }) {
    const { data, setData, post, processing, errors } = useForm<{
        facility_category_id: string; name: string; slug: string; location: string; description: string;
        image: File | null; sort_order: number; status: string; published_at: string;
    }>({
        facility_category_id: '', name: '', slug: '', location: '', description: '',
        image: null, sort_order: 0, status: 'draft', published_at: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.facilities.store'), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title="New Facility" />
            <PageHeader title="New Facility" breadcrumbs={[{ label: 'Facilities', href: route('admin.facilities') }, { label: 'New' }]} />

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
                        <Label htmlFor="facility_category_id">Category</Label>
                        <select id="facility_category_id" value={data.facility_category_id} onChange={(e) => setData('facility_category_id', e.target.value)} className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm">
                            <option value="">No category</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" value={data.location} onChange={(e) => setData('location', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={4} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                </FormSection>

                <FormSection title="Media">
                    <div>
                        <Label htmlFor="image">Image</Label>
                        <input id="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setData('image', e.target.files?.[0] ?? null)} className="mt-1.5 block text-sm" />
                    </div>
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
                    <Button type="submit" disabled={processing}>Create Facility</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
