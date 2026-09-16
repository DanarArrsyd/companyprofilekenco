import { Head, Link, router } from '@inertiajs/react';
import { Building2, Plus, Trash2 } from 'lucide-react';
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

interface Row {
    id: number; name: string; slug: string; status: string;
}

export default function Index({
    industries, filters, statusOptions,
}: {
    industries: { data: Row[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { search?: string; status?: string };
    statusOptions: string[];
}) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

    const applyFilters = (overrides: Record<string, unknown>) => {
        router.get(route('admin.industries'), { ...filters, ...overrides }, { preserveState: true, replace: true });
    };

    const columns: DataTableColumn<Row>[] = [
        { key: 'name', header: 'Name', render: (row) => <span className="font-medium text-foreground">{row.name}</span> },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        {
            key: 'actions', header: '', className: 'text-right',
            render: (row) => (
                <div className="flex justify-end gap-2">
                    {can('industries.update') && <Link href={route('admin.industries.edit', row.id)}><Button size="sm" variant="secondary">Edit</Button></Link>}
                    {can('industries.delete') && <Button size="sm" variant="danger" onClick={() => setDeleteTarget(row)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>
            <Head title="Industries" />
            <PageHeader
                title="Industries"
                description="Manage industries served."
                actions={can('industries.create') && <Link href={route('admin.industries.create')}><Button><Plus className="mr-2 h-4 w-4" />New Industry</Button></Link>}
            />

            <div className="space-y-4">
                <FilterBar>
                    <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })} placeholder="Search industries…" className="max-w-sm" />
                    <select value={filters.status ?? ''} onChange={(e) => applyFilters({ status: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm">
                        <option value="">All statuses</option>
                        {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </FilterBar>

                {industries.data.length === 0 ? <EmptyState icon={Building2} title="No industries yet" /> : <DataTable columns={columns} data={industries.data} />}
                <Pagination links={industries.links} />
            </div>

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Delete this industry?"
                confirmLabel="Delete"
                destructive
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => { if (deleteTarget) router.delete(route('admin.industries.destroy', deleteTarget.id)); setDeleteTarget(null); }}
            />
        </AdminLayout>
    );
}
