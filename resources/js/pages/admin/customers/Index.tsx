import { Head, Link, router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Handshake, ImageOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { EmptyState } from '@/components/admin/EmptyState';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import AdminLayout from '@/layouts/AdminLayout';
import { cn } from '@/lib/utils';

interface CustomerRow {
    id: number;
    name: string;
    logo: string | null;
    is_featured: boolean;
}

/** Customers Served: the logo wall on the homepage, in this order. */
export default function Index({ customers }: { customers: CustomerRow[] }) {
    const { can } = usePermissions();
    const [deleteTarget, setDeleteTarget] = useState<CustomerRow | null>(null);
    const shown = customers.filter((customer) => customer.is_featured).length;

    const move = (index: number, offset: -1 | 1) => {
        const target = index + offset;
        if (target < 0 || target >= customers.length) return;
        const ids = customers.map((customer) => customer.id);
        [ids[index], ids[target]] = [ids[target], ids[index]];
        router.post(route('admin.customers.reorder'), { ordered_ids: ids }, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <Head title="Pelanggan" />
            <PageHeader
                title="Pelanggan"
                description="Logo pelanggan untuk bagian “Customers Served” di Beranda. Hanya tampil di Beranda, tanpa link ke halaman lain."
                breadcrumbs={[{ label: 'Halaman Website' }, { label: 'Pelanggan' }]}
                actions={
                    can('customers.create') && (
                        <Link href={route('admin.customers.create')}>
                            <Button size="sm"><Plus className="mr-2 h-4 w-4" />Tambah pelanggan</Button>
                        </Link>
                    )
                }
            />

            {customers.length === 0 ? (
                <EmptyState
                    icon={Handshake}
                    title="Belum ada pelanggan"
                    description="Tambahkan nama dan logo pelanggan. Bagian “Customers Served” di Beranda baru muncul setelah ada pelanggan yang ditampilkan."
                />
            ) : (
                <div className="overflow-hidden rounded-lg border border-border bg-surface">
                    <p className="border-b border-border px-5 py-3 text-sm text-slate-500">
                        {shown} dari {customers.length} pelanggan tampil di Beranda, sesuai urutan di bawah.
                    </p>
                    <ul className="divide-y divide-border">
                        {customers.map((customer, index) => (
                            <li key={customer.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
                                <div className="flex h-14 w-28 shrink-0 items-center justify-center rounded border border-border bg-white p-2">
                                    {customer.logo ? (
                                        <img src={`/storage/${customer.logo}`} alt="" className="max-h-full max-w-full object-contain" />
                                    ) : (
                                        <ImageOff className="h-5 w-5 text-slate-500" aria-label="Belum ada logo" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-foreground">{customer.name}</p>
                                    <p className={cn('text-xs', customer.is_featured ? 'text-success' : 'text-slate-500')}>
                                        {customer.is_featured ? 'Tampil di Beranda' : 'Disembunyikan'}
                                        {!customer.logo && ' · belum ada logo (tampil sebagai nama)'}
                                    </p>
                                </div>
                                {can('customers.update') && (
                                    <div className="flex gap-1.5">
                                        <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Naikkan ${customer.name}`} className="flex h-9 w-9 items-center justify-center rounded border border-border text-slate-700 hover:bg-muted disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
                                        <button type="button" onClick={() => move(index, 1)} disabled={index === customers.length - 1} aria-label={`Turunkan ${customer.name}`} className="flex h-9 w-9 items-center justify-center rounded border border-border text-slate-700 hover:bg-muted disabled:opacity-40"><ArrowDown className="h-4 w-4" /></button>
                                        <Link href={route('admin.customers.edit', customer.id)} aria-label={`Ubah ${customer.name}`} className="flex h-9 w-9 items-center justify-center rounded border border-border text-navy-700 hover:bg-muted"><Pencil className="h-4 w-4" /></Link>
                                    </div>
                                )}
                                {can('customers.delete') && (
                                    <button type="button" onClick={() => setDeleteTarget(customer)} aria-label={`Hapus ${customer.name}`} className="flex h-9 w-9 items-center justify-center rounded border border-border text-danger hover:bg-danger/10"><Trash2 className="h-4 w-4" /></button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <ConfirmDialog
                open={deleteTarget !== null}
                title={`Hapus ${deleteTarget?.name ?? 'pelanggan'}?`}
                description="Logo tetap tersimpan di Media, hanya pelanggan ini yang dihapus dari daftar."
                confirmLabel="Hapus"
                destructive
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (deleteTarget) router.delete(route('admin.customers.destroy', deleteTarget.id), { preserveScroll: true });
                    setDeleteTarget(null);
                }}
            />
        </AdminLayout>
    );
}
