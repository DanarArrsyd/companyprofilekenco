import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { EditCard } from '@/components/admin/edit/EditCard';
import { EditPageLayout } from '@/components/admin/edit/EditPageLayout';
import { FieldHint } from '@/components/admin/FieldHint';
import { MediaPickerField } from '@/components/admin/MediaPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUnsavedChangesWarning } from '@/hooks/use-unsaved-changes-warning';
import AdminLayout from '@/layouts/AdminLayout';

interface Customer {
    id: number;
    name: string;
    logo: string | null;
    is_featured: boolean;
}

export default function Form({ customer }: { customer: Customer | null }) {
    const { data, setData, post, processing, errors, isDirty } = useForm<{
        _method: string; name: string; logo: File | null; logo_path: string; is_featured: boolean;
    }>({
        _method: customer ? 'put' : 'post',
        name: customer?.name ?? '',
        logo: null,
        logo_path: customer?.logo ?? '',
        is_featured: customer?.is_featured ?? true,
    });

    useUnsavedChangesWarning(isDirty && !processing);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(customer ? route('admin.customers.update', customer.id) : route('admin.customers.store'), { forceFormData: true });
    };

    const title = customer ? customer.name : 'Pelanggan baru';

    return (
        <AdminLayout>
            <Head title={title} />
            <EditPageLayout
                eyebrow={customer ? 'Edit pelanggan' : 'Tambah pelanggan'}
                title={title}
                breadcrumbs={[{ label: 'Pelanggan', href: route('admin.customers') }, { label: customer ? 'Edit' : 'Baru' }]}
                onSubmit={submit}
                aside={
                    <section className="space-y-4 rounded-lg border border-border bg-surface p-5">
                        {isDirty && (
                            <p role="status" className="rounded bg-warning/10 px-3 py-2 text-sm font-medium text-warning">Ada perubahan yang belum disimpan</p>
                        )}
                        <label className="flex items-start gap-3 text-sm">
                            <input type="checkbox" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)} className="mt-0.5 rounded border-border" />
                            <span>
                                <span className="block font-medium text-foreground">Tampilkan di Beranda</span>
                                <span className="mt-0.5 block text-xs text-slate-500">Matikan untuk menyembunyikan tanpa menghapus.</span>
                            </span>
                        </label>
                        <Button type="submit" disabled={processing} className="h-11 w-full">
                            {processing ? 'Menyimpan…' : customer ? 'Simpan perubahan' : 'Tambah pelanggan'}
                        </Button>
                        <p className="text-center text-xs text-slate-500">Tampil di Beranda, bagian “Customers Served”, tanpa link.</p>
                    </section>
                }
            >
                <EditCard title="Pelanggan" description="Nama dipakai sebagai teks alternatif logo, dan tampil sebagai tulisan kalau logo belum ada.">
                    <div>
                        <Label htmlFor="name">Nama pelanggan</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="mis. PT Astra Daihatsu Motor" className="mt-1.5" />
                        {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
                    </div>
                </EditCard>

                <EditCard title="Logo" description="PNG atau WebP dengan latar transparan paling rapi. Tampil dalam kotak putih yang sama besar, jadi logo lebar dan logo kotak tetap seimbang.">
                    <MediaPickerField
                        label="Logo pelanggan"
                        currentUrl={data.logo ? URL.createObjectURL(data.logo) : data.logo_path ? `/storage/${data.logo_path}` : null}
                        onUploadFile={(file) => { setData('logo', file); setData('logo_path', ''); }}
                        onSelectPath={(path) => { setData('logo_path', path); setData('logo', null); }}
                        onClear={() => { setData('logo', null); setData('logo_path', ''); }}
                        error={errors.logo ?? errors.logo_path}
                    />
                    <FieldHint>Maksimal 2 MB. JPG, PNG atau WebP.</FieldHint>
                </EditCard>
            </EditPageLayout>
        </AdminLayout>
    );
}
