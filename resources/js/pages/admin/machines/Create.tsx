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
import { FieldHint } from '@/components/admin/FieldHint';
import { fieldHelp } from '@/lib/admin-field-help';

export default function Create({
    facilities, capabilities, statusOptions,
}: {
    facilities: { id: number; name: string }[];
    capabilities: { id: number; name: string }[];
    statusOptions: string[];
}) {
    const { data, setData, post, processing, errors } = useForm<{
        facility_id: string; name: string; brand: string; model: string; quantity: number;
        capacity: string; description: string; specification: string; image: File | null; image_path: string;
        sort_order: number; status: string; capability_ids: number[];
    }>({
        facility_id: '', name: '', brand: '', model: '', quantity: 1,
        capacity: '', description: '', specification: '', image: null, image_path: '',
        sort_order: 0, status: 'published', capability_ids: [],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.machines.store'), { forceFormData: true });
    };

    const toggleCapability = (id: number) => {
        setData('capability_ids', data.capability_ids.includes(id) ? data.capability_ids.filter((v) => v !== id) : [...data.capability_ids, id]);
    };

    return (
        <AdminLayout>
            <Head title="New Machine" />
            <PageHeader title="New Machine" breadcrumbs={[{ label: 'Machines', href: route('admin.machines') }, { label: 'New' }]} />

            <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                <FormSection title="General">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder={fieldHelp('machines', 'name').example} value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1.5" autoFocus />
                        {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
                    </div>
                    <div>
                        <Label htmlFor="facility_id">Facility</Label>
                        <select id="facility_id" aria-describedby="facility_id-help" value={data.facility_id} onChange={(e) => setData('facility_id', e.target.value)} className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm">
                            <option value="">No facility</option>
                            {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                        <FieldHint id="facility_id-help">{fieldHelp('machines', 'facility_id').hint}</FieldHint>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="brand">Brand</Label>
                            <Input id="brand" placeholder={fieldHelp('machines', 'brand').example} value={data.brand} onChange={(e) => setData('brand', e.target.value)} className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="model">Model</Label>
                            <Input id="model" placeholder={fieldHelp('machines', 'model').example} value={data.model} onChange={(e) => setData('model', e.target.value)} className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input id="quantity" aria-describedby="quantity-help" type="number" min={1} value={data.quantity} onChange={(e) => setData('quantity', Number(e.target.value))} className="mt-1.5" />
                            <FieldHint id="quantity-help">{fieldHelp('machines', 'quantity').hint}</FieldHint>
                            {errors.quantity && <p className="mt-1 text-sm text-danger">{errors.quantity}</p>}
                        </div>
                        <div>
                            <Label htmlFor="capacity">Capacity</Label>
                            <Input id="capacity" aria-describedby="capacity-help" value={data.capacity} onChange={(e) => setData('capacity', e.target.value)} className="mt-1.5" placeholder="e.g. 50 ton" />
                            <FieldHint id="capacity-help">{fieldHelp('machines', 'capacity').hint}</FieldHint>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <Label htmlFor="specification">Specification</Label>
                        <textarea id="specification" aria-describedby="specification-help" placeholder={fieldHelp('machines', 'specification').example} value={data.specification} onChange={(e) => setData('specification', e.target.value)} rows={3} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                        <FieldHint id="specification-help">{fieldHelp('machines', 'specification').hint}</FieldHint>
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

                <FormSection title="Capabilities" description="Manufacturing capabilities this machine supports.">
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
                        <Input id="sort_order" aria-describedby="sort_order-help" type="number" value={data.sort_order} onChange={(e) => setData('sort_order', Number(e.target.value))} className="mt-1.5" />
                        <FieldHint id="sort_order-help">{fieldHelp('machines', 'sort_order').hint}</FieldHint>
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select id="status" aria-describedby="status-help" value={data.status} onChange={(e) => setData('status', e.target.value)} className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm">
                            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <FieldHint id="status-help">{fieldHelp('machines', 'status').hint}</FieldHint>
                    </div>
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={processing}>Create Machine</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
