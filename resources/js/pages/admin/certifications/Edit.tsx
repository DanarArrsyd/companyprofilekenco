import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { FormEventHandler, useRef } from 'react';

import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { MediaPickerField } from '@/components/admin/MediaPicker';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';
import { mediaUrl } from '@/lib/media';

interface Certification {
    id: number; name: string; issuer: string | null; certificate_number: string | null;
    issued_at: string | null; expires_at: string | null; document_path: string | null;
    sort_order: number; status: string; published_at: string | null;
    media: { path: string } | null;
}

function isExpired(expiresAt: string | null): boolean {
    return !!expiresAt && new Date(expiresAt) < new Date();
}

export default function Edit({ certification, statusOptions }: { certification: Certification; statusOptions: string[] }) {
    const documentInputRef = useRef<HTMLInputElement>(null);
    const { data, setData, post, processing, errors } = useForm<{
        _method: string; name: string; issuer: string; certificate_number: string; issued_at: string; expires_at: string;
        image: File | null; image_path: string; document: File | null; sort_order: number; status: string; published_at: string;
    }>({
        _method: 'put',
        name: certification.name,
        issuer: certification.issuer ?? '',
        certificate_number: certification.certificate_number ?? '',
        issued_at: certification.issued_at ?? '',
        expires_at: certification.expires_at ?? '',
        image: null,
        image_path: certification.media?.path ?? '',
        document: null,
        sort_order: certification.sort_order,
        status: certification.status,
        published_at: certification.published_at ? certification.published_at.slice(0, 16) : '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.certifications.update', certification.id), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${certification.name}`} />
            <PageHeader title={certification.name} breadcrumbs={[{ label: 'Certifications', href: route('admin.certifications') }, { label: 'Edit' }]} />

            {isExpired(certification.expires_at) && (
                <div className="mb-4 flex items-center gap-2 rounded border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                    <AlertTriangle className="h-4 w-4" />
                    This certificate expired on {new Date(certification.expires_at!).toLocaleDateString()}. It remains visible until you update or remove it.
                </div>
            )}

            <form onSubmit={submit} className="rounded border border-border bg-surface px-6">
                <FormSection title="General">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1.5" />
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

                <FormSection title="Media">
                    <MediaPickerField
                        label="Certificate Image"
                        currentFile={data.image}
                        currentUrl={mediaUrl(data.image_path)}
                        onUploadFile={(file) => { setData('image', file); setData('image_path', ''); }}
                        onSelectPath={(path) => { setData('image_path', path); setData('image', null); }}
                        onClear={() => { setData('image', null); setData('image_path', ''); }}
                        error={errors.image ?? errors.image_path}
                    />
                    <div>
                        {certification.document_path && (
                            <a href={route('admin.certifications.document', certification.id)} className="text-sm text-primary hover:underline">
                                View current document
                            </a>
                        )}
                        <Label htmlFor="document" className="mt-2 block">Replace Document (PDF)</Label>
                        <input ref={documentInputRef} id="document" type="file" accept="application/pdf" disabled={processing} onChange={(e) => setData('document', e.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" />
                        <p className="mt-1 text-xs text-slate-500">PDF only. Maximum 10 MB. Stored privately.</p>
                        {data.document && (
                            <div className="mt-2 flex items-center justify-between gap-3 rounded border border-border bg-muted/40 px-3 py-2 text-sm">
                                <span className="truncate text-foreground">Selected: {data.document.name}</span>
                                <Button type="button" size="sm" variant="ghost" onClick={() => { setData('document', null); if (documentInputRef.current) documentInputRef.current.value = ''; }}>Clear</Button>
                            </div>
                        )}
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
                    <Button type="submit" disabled={processing}>{processing ? 'Saving…' : 'Save Changes'}</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
