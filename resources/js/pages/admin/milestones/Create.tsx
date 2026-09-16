import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { MediaPickerField } from '@/components/admin/MediaPicker';
import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm<{
        year: number;
        title: string;
        description: string;
        image: File | null;
        image_path: string;
        order: number;
    }>({
        year: new Date().getFullYear(),
        title: '',
        description: '',
        image: null,
        image_path: '',
        order: 0,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.milestones.store'), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title="New Milestone" />
            <PageHeader title="New Milestone" breadcrumbs={[{ label: 'Milestones', href: route('admin.milestones') }, { label: 'New' }]} />

            <form onSubmit={submit} className="rounded border border-border bg-surface px-6">
                <FormSection title="General">
                    <div>
                        <Label htmlFor="year">Year</Label>
                        <Input id="year" type="number" value={data.year} onChange={(e) => setData('year', Number(e.target.value))} className="mt-1.5" autoFocus />
                        {errors.year && <p className="mt-1 text-sm text-danger">{errors.year}</p>}
                    </div>
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} className="mt-1.5" />
                        {errors.title && <p className="mt-1 text-sm text-danger">{errors.title}</p>}
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                </FormSection>

                <FormSection title="Media">
                    <MediaPickerField
                        label="Image"
                        currentUrl={data.image ? URL.createObjectURL(data.image) : (data.image_path ? `/storage/${data.image_path}` : null)}
                        onUploadFile={(file) => { setData('image', file); setData('image_path', ''); }}
                        onSelectPath={(path) => { setData('image_path', path); setData('image', null); }}
                        onClear={() => { setData('image', null); setData('image_path', ''); }}
                        error={errors.image}
                    />
                </FormSection>

                <FormSection title="Ordering">
                    <div>
                        <Label htmlFor="order">Sort order</Label>
                        <Input id="order" type="number" value={data.order} onChange={(e) => setData('order', Number(e.target.value))} className="mt-1.5" />
                    </div>
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={processing}>Create Milestone</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
