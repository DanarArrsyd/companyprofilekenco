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

interface MilestoneRecord {
    id: number;
    year: number;
    title: string;
    description: string | null;
    image: string | null;
    order: number;
}

export default function Edit({ milestone }: { milestone: MilestoneRecord }) {
    const { data, setData, post, processing, errors } = useForm<{
        _method: string;
        year: number;
        title: string;
        description: string;
        image: File | null;
        image_path: string;
        remove_image: boolean;
        order: number;
    }>({
        _method: 'put',
        year: milestone.year,
        title: milestone.title,
        description: milestone.description ?? '',
        image: null,
        image_path: '',
        remove_image: false,
        order: milestone.order,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.milestones.update', milestone.id), { forceFormData: true });
    };

    const existingUrl = milestone.image ? `/storage/${milestone.image}` : null;
    const currentUrl = data.image
        ? URL.createObjectURL(data.image)
        : data.image_path
            ? `/storage/${data.image_path}`
            : (data.remove_image ? null : existingUrl);

    return (
        <AdminLayout>
            <Head title={`Edit ${milestone.title}`} />
            <PageHeader title={milestone.title} breadcrumbs={[{ label: 'Milestones', href: route('admin.milestones') }, { label: 'Edit' }]} />

            <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                <FormSection title="General">
                    <div>
                        <Label htmlFor="year">Year</Label>
                        <Input id="year" type="number" value={data.year} onChange={(e) => setData('year', Number(e.target.value))} className="mt-1.5" />
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
                        currentUrl={currentUrl}
                        onUploadFile={(file) => { setData('image', file); setData('image_path', ''); setData('remove_image', false); }}
                        onSelectPath={(path) => { setData('image_path', path); setData('image', null); setData('remove_image', false); }}
                        onClear={() => { setData('image', null); setData('image_path', ''); setData('remove_image', true); }}
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
                    <Button type="submit" disabled={processing}>Save Changes</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
