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
    segment: string;
    logo: string | null;
    is_featured: boolean;
}

interface Segment {
    value: string;
    label: string;
}

/** Customers Served: one logo row per segment on the homepage, in this order. */
export default function Index({ customers, segments }: { customers: CustomerRow[]; segments: Segment[] }) {
    const { can } = usePermissions();
    const [deleteTarget, setDeleteTarget] = useState<CustomerRow | null>(null);

    // Order is per segment: moving swaps two neighbours inside the same row.
    const move = (group: CustomerRow[], index: number, offset: -1 | 1) => {
        const target = index + offset;
        if (target < 0 || target >= group.length) return;
        const ids = group.map((customer) => customer.id);
        [ids[index], ids[target]] = [ids[target], ids[index]];
        router.post(route('admin.customers.reorder'), { ordered_ids: ids }, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <Head title="Pelanggan" />
            <PageHeader
                title="Pelanggan"
                description="Logo pelanggan untuk bagian “Customers Served” di Beranda: satu baris berjalan per kategori, Stamping di atas. Hanya tampil di Beranda, tanpa link."
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
                    description="Tambahkan nama, kategori dan logo pelanggan. Bagian “Customers Served” di Beranda muncul setelah ada pelanggan yang ditampilkan."
                />
            ) : (
                <div className="space-y-6">
                    {segments.map((segment) => {
                        const group = customers.filter((customer) => customer.segment === segment.value);
                        const shown = group.filter((customer) => customer.is_featured).length;

                        return (
                            <section key={segment.value} className="overflow-hidden rounded-lg border border-border bg-surface">
                                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-5 py-3">
                                    <h2 className="text-base font-semibold text-foreground">{segment.label}</h2>
                                    <p className="text-sm text-slate-500">{shown} dari {group.length} tampil di Beranda</p>
                                </div>
                                {group.length === 0 ? (
                                    <p className="px-5 py-4 text-sm text-slate-500">Belum ada pelanggan di kategori ini; barisnya tidak tampil di Beranda.</p>
                                ) : (
                                    <ul className="divide-y divide-border">
                                        {group.map((customer, index) => (
                                            <li key={customer.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
                                                <div className="flex h-14 w-28 shrink-0 items-center justify-center rounded border border-border bg-muted p-2">
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
                                                        <button type="button" onClick={() => move(group, index, -1)} disabled={index === 0} aria-label={`Naikkan ${customer.name}`} className="flex h-9 w-9 items-center justify-center rounded border border-border text-slate-700 hover:bg-muted disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
                                                        <button type="button" onClick={() => move(group, index, 1)} disabled={index === group.length - 1} aria-label={`Turunkan ${customer.name}`} className="flex h-9 w-9 items-center justify-center rounded border border-border text-slate-700 hover:bg-muted disabled:opacity-40"><ArrowDown className="h-4 w-4" /></button>
                                                        <Link href={route('admin.customers.edit', customer.id)} aria-label={`Ubah ${customer.name}`} className="flex h-9 w-9 items-center justify-center rounded border border-border text-navy-700 hover:bg-muted"><Pencil className="h-4 w-4" /></Link>
                                                    </div>
                                                )}
                                                {can('customers.delete') && (
                                                    <button type="button" onClick={() => setDeleteTarget(customer)} aria-label={`Hapus ${customer.name}`} className="flex h-9 w-9 items-center justify-center rounded border border-border text-danger hover:bg-danger/10"><Trash2 className="h-4 w-4" /></button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        );
                    })}
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
