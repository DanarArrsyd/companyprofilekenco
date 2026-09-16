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
    const { data, setData, post, processing, errors } = useForm<{
        name: string; issuer: string; certificate_number: string; issued_at: string; expires_at: string;
        image: File | null; document: File | null; sort_order: number; status: string; published_at: string;
    }>({
        name: '', issuer: '', certificate_number: '', issued_at: '', expires_at: '',
        image: null, document: null, sort_order: 0, status: 'draft', published_at: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.certifications.store'), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title="New Certification" />
            <PageHeader title="New Certification" breadcrumbs={[{ label: 'Certifications', href: route('admin.certifications') }, { label: 'New' }]} />

            <form onSubmit={submit} className="rounded border border-border bg-surface px-6">
                <FormSection title="General">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1.5" autoFocus />
                        {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
                    </div>
                    <div>
                        <Label htmlFor="issuer">Issuer</Label>
                        <Input id="issuer" value={data.issuer} onChange={(e) => setData('issuer', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor="certificate_number">Certificate Number</Label>
                        <Input id="certificate_number" value={data.certificate_number} onChange={(e) => setData('certificate_number', e.target.value)} className="mt-1.5" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="issued_at">Issue Date</Label>
                            <Input id="issued_at" type="date" value={data.issued_at} onChange={(e) => setData('issued_at', e.target.value)} className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="expires_at">Expiry Date</Label>
                            <Input id="expires_at" type="date" value={data.expires_at} onChange={(e) => setData('expires_at', e.target.value)} className="mt-1.5" />
                            {errors.expires_at && <p className="mt-1 text-sm text-danger">{errors.expires_at}</p>}
                        </div>
                    </div>
                </FormSection>

                <FormSection title="Media" description="Certificate badge image and the official PDF document.">
                    <div>
                        <Label htmlFor="image">Certificate Image</Label>
                        <input id="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setData('image', e.target.files?.[0] ?? null)} className="mt-1.5 block text-sm" />
                    </div>
                    <div>
                        <Label htmlFor="document">Certificate Document (PDF)</Label>
                        <input id="document" type="file" accept="application/pdf" onChange={(e) => setData('document', e.target.files?.[0] ?? null)} className="mt-1.5 block text-sm" />
                        {errors.document && <p className="mt-1 text-sm text-danger">{errors.document}</p>}
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
                    <Button type="submit" disabled={processing}>Create Certification</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
