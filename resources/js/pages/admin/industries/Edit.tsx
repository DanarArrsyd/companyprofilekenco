import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';

interface Industry {
    id: number; name: string; slug: string; description: string | null; image: string | null;
    sort_order: number; status: string; published_at: string | null;
}

export default function Edit({ industry, statusOptions }: { industry: Industry; statusOptions: string[] }) {
    const { data, setData, post, processing, errors } = useForm<{
        _method: string; name: string; description: string; image: File | null;
        sort_order: number; status: string; published_at: string;
    }>({
        _method: 'put',
        name: industry.name,
        description: industry.description ?? '',
        image: null,
        sort_order: industry.sort_order,
        status: industry.status,
        published_at: industry.published_at ? industry.published_at.slice(0, 16) : '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.industries.update', industry.id), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${industry.name}`} />
            <PageHeader title={industry.name} breadcrumbs={[{ label: 'Industries', href: route('admin.industries') }, { label: 'Edit' }]} />

            <form onSubmit={submit} className="rounded border border-border bg-surface px-6">
                <FormSection title="General">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1.5" />
                        {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
                    </div>
                    <div>
                        <Label>Slug</Label>
                        <p className="mt-1.5 rounded border border-border bg-muted px-3 py-2 text-sm text-slate-600">/{industry.slug}</p>
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={4} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                </FormSection>

                <FormSection title="Media">
                    <div>
                        {industry.image && <img src={`/storage/${industry.image}`} alt="" className="mb-3 h-32 w-32 rounded border border-border object-cover" />}
                        <Label htmlFor="image">Replace Image</Label>
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
                    <Button type="submit" disabled={processing}>Save Changes</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
