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

interface Machine {
    id: number; facility_id: number | null; name: string; brand: string | null; model: string | null;
    quantity: number; capacity: string | null; description: string | null; specification: string | null;
    image: string | null; sort_order: number; status: string;
    capabilities: { id: number; name: string }[];
}

export default function Edit({
    machine, facilities, capabilities, statusOptions,
}: {
    machine: Machine;
    facilities: { id: number; name: string }[];
    capabilities: { id: number; name: string }[];
    statusOptions: string[];
}) {
    const { data, setData, post, processing, errors } = useForm<{
        _method: string; facility_id: string; name: string; brand: string; model: string; quantity: number;
        capacity: string; description: string; specification: string; image: File | null; image_path: string;
        sort_order: number; status: string; capability_ids: number[];
    }>({
        _method: 'put',
        facility_id: machine.facility_id ? String(machine.facility_id) : '',
        name: machine.name,
        brand: machine.brand ?? '',
        model: machine.model ?? '',
        quantity: machine.quantity,
        capacity: machine.capacity ?? '',
        description: machine.description ?? '',
        specification: machine.specification ?? '',
        image: null,
        image_path: machine.image ?? '',
        sort_order: machine.sort_order,
        status: machine.status,
        capability_ids: machine.capabilities.map((c) => c.id),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.machines.update', machine.id), { forceFormData: true });
    };

    const toggleCapability = (id: number) => {
        setData('capability_ids', data.capability_ids.includes(id) ? data.capability_ids.filter((v) => v !== id) : [...data.capability_ids, id]);
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${machine.name}`} />
            <PageHeader title={machine.name} breadcrumbs={[{ label: 'Machines', href: route('admin.machines') }, { label: 'Edit' }]} />

            <form onSubmit={submit} className="rounded border border-border bg-surface px-6">
                <FormSection title="General">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1.5" />
                        {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
                    </div>
                    <div>
                        <Label htmlFor="facility_id">Facility</Label>
                        <select id="facility_id" value={data.facility_id} onChange={(e) => setData('facility_id', e.target.value)} className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm">
                            <option value="">No facility</option>
                            {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="brand">Brand</Label>
                            <Input id="brand" value={data.brand} onChange={(e) => setData('brand', e.target.value)} className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="model">Model</Label>
                            <Input id="model" value={data.model} onChange={(e) => setData('model', e.target.value)} className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input id="quantity" type="number" min={1} value={data.quantity} onChange={(e) => setData('quantity', Number(e.target.value))} className="mt-1.5" />
                            {errors.quantity && <p className="mt-1 text-sm text-danger">{errors.quantity}</p>}
                        </div>
                        <div>
                            <Label htmlFor="capacity">Capacity</Label>
                            <Input id="capacity" value={data.capacity} onChange={(e) => setData('capacity', e.target.value)} className="mt-1.5" />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <Label htmlFor="specification">Specification</Label>
                        <textarea id="specification" value={data.specification} onChange={(e) => setData('specification', e.target.value)} rows={3} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                </FormSection>

                <FormSection title="Media">
                    <MediaPickerField
                        label="Machine Image"
                        currentFile={data.image}
                        currentUrl={mediaUrl(data.image_path)}
                        onUploadFile={(file) => { setData('image', file); setData('image_path', ''); }}
                        onSelectPath={(path) => { setData('image_path', path); setData('image', null); }}
                        onClear={() => { setData('image', null); setData('image_path', ''); }}
                        error={errors.image ?? errors.image_path}
                    />
                </FormSection>

                <FormSection title="Capabilities">
                    {capabilities.length === 0 ? (
                        <p className="text-sm text-slate-500">No published capabilities available yet.</p>
                    ) : (
                        <div className="space-y-1">
                            {capabilities.map((c) => (
                                <label key={c.id} className="flex items-center gap-2 text-sm text-slate-700">
                                    <input type="checkbox" checked={data.capability_ids.includes(c.id)} onChange={() => toggleCapability(c.id)} className="rounded border-border" />
                                    {c.name}
                                </label>
                            ))}
                        </div>
                    )}
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
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={processing}>Save Changes</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
