import { Head, router, useForm } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Eye, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { MediaPickerField } from '@/components/admin/MediaPicker';
import { PageHeader } from '@/components/admin/PageHeader';
import { SEO_FIELDS_DEFAULT, SeoFields, SeoFieldsData } from '@/components/admin/SeoFields';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePermissions } from '@/hooks/use-permissions';
import AdminLayout from '@/layouts/AdminLayout';

interface Step {
    id: number;
    title: string;
    description: string | null;
    sort_order: number;
}

interface Capability {
    id: number; name: string; slug: string; summary: string | null; description: string | null;
    icon: string | null; featured_image: string | null; is_featured: boolean; sort_order: number;
    status: string; published_at: string | null;
    steps: Step[];
    machines: { id: number; name: string }[];
    seoMetadata: {
        meta_title: string | null; meta_description: string | null; canonical_url: string | null;
        og_title: string | null; og_description: string | null; og_image: string | null;
        robots_index: boolean; robots_follow: boolean;
    } | null;
}

function StepRow({ capabilityId, step, isFirst, isLast, onMove }: { capabilityId: number; step: Step; isFirst: boolean; isLast: boolean; onMove: (dir: 'up' | 'down') => void }) {
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const { data, setData, put, processing } = useForm({ title: step.title, description: step.description ?? '' });

    return (
        <div className="rounded-lg border border-border bg-surface p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
                <div className="space-y-3">
                    <Input value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="Step title" />
                    <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={2} placeholder="Step description" className="w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                </div>
                <div className="flex items-start gap-2">
                    <Button type="button" variant="secondary" size="sm" disabled={isFirst} onClick={() => onMove('up')} aria-label="Move up"><ChevronUp className="h-4 w-4" /></Button>
                    <Button type="button" variant="secondary" size="sm" disabled={isLast} onClick={() => onMove('down')} aria-label="Move down"><ChevronDown className="h-4 w-4" /></Button>
                    <Button type="button" size="sm" onClick={() => put(route('admin.capabilities.steps.update', [capabilityId, step.id]), { preserveScroll: true })} disabled={processing}>Save</Button>
                    <Button type="button" variant="danger" size="sm" onClick={() => setConfirmingDelete(true)} aria-label="Delete step"><Trash2 className="h-4 w-4" /></Button>
                </div>
            </div>

            <ConfirmDialog
                open={confirmingDelete}
                title="Remove this step?"
                confirmLabel="Remove"
                destructive
                onCancel={() => setConfirmingDelete(false)}
                onConfirm={() => {
                    router.delete(route('admin.capabilities.steps.destroy', [capabilityId, step.id]), { preserveScroll: true });
                    setConfirmingDelete(false);
                }}
            />
        </div>
    );
}

export default function Edit({
    capability,
    availableMachines,
    statusOptions,
}: {
    capability: Capability;
    availableMachines: { id: number; name: string }[];
    statusOptions: string[];
}) {
    const { can } = usePermissions();
    const steps = capability.steps ?? [];
    const [newStepTitle, setNewStepTitle] = useState('');
    const [selectedMachines, setSelectedMachines] = useState<number[]>(capability.machines.map((m) => m.id));

    const { data, setData, post, processing, errors } = useForm<{
        _method: string; name: string; summary: string; description: string; icon: string;
        featured_image: File | null; featured_image_path: string; is_featured: boolean; sort_order: number;
        status: string; published_at: string;
        seo: SeoFieldsData;
    }>({
        _method: 'put',
        name: capability.name,
        summary: capability.summary ?? '',
        description: capability.description ?? '',
        icon: capability.icon ?? '',
        featured_image: null,
        featured_image_path: '',
        is_featured: capability.is_featured,
        sort_order: capability.sort_order,
        status: capability.status,
        published_at: capability.published_at ? capability.published_at.slice(0, 16) : '',
        seo: {
            ...SEO_FIELDS_DEFAULT,
            meta_title: capability.seoMetadata?.meta_title ?? '',
            meta_description: capability.seoMetadata?.meta_description ?? '',
            canonical_url: capability.seoMetadata?.canonical_url ?? '',
            og_title: capability.seoMetadata?.og_title ?? '',
            og_description: capability.seoMetadata?.og_description ?? '',
            og_image_path: capability.seoMetadata?.og_image ?? '',
            robots_index: capability.seoMetadata?.robots_index ?? true,
            robots_follow: capability.seoMetadata?.robots_follow ?? true,
        },
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.capabilities.update', capability.id), { forceFormData: true });
    };

    const addStep = () => {
        if (!newStepTitle.trim()) return;
        router.post(route('admin.capabilities.steps.store', capability.id), { title: newStepTitle }, {
            preserveScroll: true,
            onSuccess: () => setNewStepTitle(''),
        });
    };

    const moveStep = (index: number, direction: 'up' | 'down') => {
        const target = direction === 'up' ? index - 1 : index + 1;
        if (target < 0 || target >= steps.length) return;
        const reordered = [...steps];
        [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
        router.post(route('admin.capabilities.steps.reorder', capability.id), { ordered_ids: reordered.map((s) => s.id) }, { preserveScroll: true });
    };

    const toggleMachine = (id: number) => {
        setSelectedMachines((current) => current.includes(id) ? current.filter((v) => v !== id) : [...current, id]);
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${capability.name}`} />

            <PageHeader
                title={capability.name}
                breadcrumbs={[{ label: 'Capabilities', href: route('admin.capabilities') }, { label: 'Edit' }]}
                actions={
                    <div className="flex items-center gap-2">
                        <StatusBadge status={capability.status} />
                        <a href={route('admin.capabilities.preview', capability.id)} target="_blank" rel="noreferrer">
                            <Button variant="secondary" size="sm"><Eye className="mr-2 h-4 w-4" />Preview</Button>
                        </a>
                        {can('capabilities.update') && capability.status !== 'published' && (
                            <Button size="sm" onClick={() => router.post(route('admin.capabilities.publish', capability.id))}>Publish</Button>
                        )}
                        {can('capabilities.update') && capability.status !== 'archived' && (
                            <Button variant="secondary" size="sm" onClick={() => router.post(route('admin.capabilities.archive', capability.id))}>Archive</Button>
                        )}
                    </div>
                }
            />

            <div className="space-y-6">
                <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                    <FormSection title="General">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1.5" />
                            {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
                        </div>
                        <div>
                            <Label>Slug</Label>
                            <p className="mt-1.5 rounded border border-border bg-muted px-3 py-2 text-sm text-slate-600">/capabilities/{capability.slug}</p>
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
                            <Label htmlFor="icon">Icon</Label>
                            <Input id="icon" value={data.icon} onChange={(e) => setData('icon', e.target.value)} className="mt-1.5" />
                        </div>
                    </FormSection>

                    <FormSection title="Media">
                        <MediaPickerField
                            label="Featured Image"
                            currentUrl={data.featured_image ? URL.createObjectURL(data.featured_image) : (data.featured_image_path ? `/storage/${data.featured_image_path}` : (capability.featured_image ? `/storage/${capability.featured_image}` : null))}
                            onUploadFile={(file) => { setData('featured_image', file); setData('featured_image_path', ''); }}
                            onSelectPath={(path) => { setData('featured_image_path', path); setData('featured_image', null); }}
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
                            titleFallback={capability.name}
                            pageUrl={`/capabilities/${capability.slug}`}
                        />
                    </FormSection>

                    <FormActions>
                        <Button type="submit" disabled={processing}>Save Changes</Button>
                    </FormActions>
                </form>

                <div className="rounded-lg border border-border bg-surface p-6 sm:p-8">
                    <h2 className="text-sm font-semibold text-foreground">Process Steps</h2>
                    <div className="mt-5 space-y-4">
                        {steps.map((step, index) => (
                            <StepRow key={step.id} capabilityId={capability.id} step={step} isFirst={index === 0} isLast={index === steps.length - 1} onMove={(dir) => moveStep(index, dir)} />
                        ))}
                    </div>
                    <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                        <Input value={newStepTitle} onChange={(e) => setNewStepTitle(e.target.value)} placeholder="New step title" className="max-w-sm" />
                        <Button type="button" size="sm" onClick={addStep}><Plus className="mr-2 h-4 w-4" />Add Step</Button>
                    </div>
                </div>

                <div className="rounded-lg border border-border bg-surface p-6 sm:p-8">
                    <h2 className="text-sm font-semibold text-foreground">Assigned Machines</h2>
                    {availableMachines.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-500">No published machines available yet.</p>
                    ) : (
                        <div className="mt-3 space-y-1">
                            {availableMachines.map((machine) => (
                                <label key={machine.id} className="flex items-center gap-2 text-sm text-slate-700">
                                    <input type="checkbox" checked={selectedMachines.includes(machine.id)} onChange={() => toggleMachine(machine.id)} className="rounded border-border" />
                                    {machine.name}
                                </label>
                            ))}
                        </div>
                    )}
                    <Button
                        type="button"
                        size="sm"
                        className="mt-4"
                        onClick={() => router.post(route('admin.capabilities.machines', capability.id), { machine_ids: selectedMachines }, { preserveScroll: true })}
                    >
                        Save Machine Assignments
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
}
