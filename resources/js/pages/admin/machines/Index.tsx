import { Head, Link, router } from '@inertiajs/react';
import { Cog, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { DataTable, DataTableColumn } from '@/components/admin/DataTable';
import { EmptyState } from '@/components/admin/EmptyState';
import { FilterBar } from '@/components/admin/FilterBar';
import { PageHeader } from '@/components/admin/PageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { SearchInput } from '@/components/admin/SearchInput';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import AdminLayout from '@/layouts/AdminLayout';

interface MachineRow {
    id: number; name: string; brand: string | null; quantity: number; status: string;
    facility: { id: number; name: string } | null;
}

export default function Index({
    machines, filters, facilities, statusOptions,
}: {
    machines: { data: MachineRow[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { search?: string; facility?: string; status?: string };
    facilities: { id: number; name: string }[];
    statusOptions: string[];
}) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<MachineRow | null>(null);

    const applyFilters = (overrides: Record<string, unknown>) => {
        router.get(route('admin.machines'), { ...filters, ...overrides }, { preserveState: true, replace: true });
    };

    const columns: DataTableColumn<MachineRow>[] = [
        { key: 'name', header: 'Name', render: (row) => <span className="font-medium text-foreground">{row.name}</span> },
        { key: 'brand', header: 'Brand', render: (row) => row.brand ?? '—' },
        { key: 'quantity', header: 'Qty', render: (row) => row.quantity },
        { key: 'facility', header: 'Facility', render: (row) => row.facility?.name ?? '—' },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        {
            key: 'actions', header: '', className: 'text-right',
            render: (row) => (
                <div className="flex justify-end gap-2">
                    {can('facilities.update') && <Link href={route('admin.machines.edit', row.id)}><Button size="sm" variant="secondary">Edit</Button></Link>}
                    {can('facilities.delete') && <Button size="sm" variant="danger" onClick={() => setDeleteTarget(row)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>
            <Head title="Machines" />
            <PageHeader
                title="Machines"
                description="Manage machines per facility."
                actions={can('facilities.create') && <Link href={route('admin.machines.create')}><Button><Plus className="mr-2 h-4 w-4" />New Machine</Button></Link>}
            />

            <div className="space-y-6">
                <FilterBar>
                    <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })} placeholder="Search machines…" className="max-w-sm" />
                    <div className="flex items-center gap-2">
                        <select value={filters.facility ?? ''} onChange={(e) => applyFilters({ facility: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm">
                            <option value="">All facilities</option>
                            {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                        <select value={filters.status ?? ''} onChange={(e) => applyFilters({ status: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm">
                            <option value="">All statuses</option>
                            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </FilterBar>

                {machines.data.length === 0 ? <EmptyState icon={Cog} title="No machines yet" /> : <DataTable columns={columns} data={machines.data} />}
                <Pagination links={machines.links} />
            </div>

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Delete this machine?"
                confirmLabel="Delete"
                destructive
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => { if (deleteTarget) router.delete(route('admin.machines.destroy', deleteTarget.id)); setDeleteTarget(null); }}
            />
        </AdminLayout>
    );
}
