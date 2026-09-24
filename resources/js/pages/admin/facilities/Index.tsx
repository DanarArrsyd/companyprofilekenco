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

interface FacilityRow {
    id: number; name: string; slug: string; status: string;
    category: { id: number; name: string } | null;
}

export default function Index({
    facilities, filters, categories, statusOptions,
}: {
    facilities: { data: FacilityRow[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { search?: string; category?: string; status?: string };
    categories: { id: number; name: string }[];
    statusOptions: string[];
}) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<FacilityRow | null>(null);

    const applyFilters = (overrides: Record<string, unknown>) => {
        router.get(route('admin.facilities'), { ...filters, ...overrides }, { preserveState: true, replace: true });
    };

    const columns: DataTableColumn<FacilityRow>[] = [
        { key: 'name', header: 'Name', render: (row) => <span className="font-medium text-foreground">{row.name}</span> },
        { key: 'category', header: 'Category', render: (row) => row.category?.name ?? '—' },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        {
            key: 'actions', header: '', className: 'text-right',
            render: (row) => (
                <div className="flex justify-end gap-2">
                    {can('facilities.update') && <Link href={route('admin.facilities.edit', row.id)}><Button size="sm" variant="secondary">Edit</Button></Link>}
                    {can('facilities.delete') && <Button size="sm" variant="danger" onClick={() => setDeleteTarget(row)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>
            <Head title="Facilities" />
            <PageHeader
                title="Facilities"
                description="Manage production facilities."
                actions={can('facilities.create') && <Link href={route('admin.facilities.create')}><Button><Plus className="mr-2 h-4 w-4" />New Facility</Button></Link>}
            />

            <div className="space-y-6">
                <FilterBar>
                    <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })} placeholder="Search facilities…" className="max-w-sm" />
                    <div className="flex items-center gap-2">
                        <select value={filters.category ?? ''} onChange={(e) => applyFilters({ category: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm">
                            <option value="">All categories</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select value={filters.status ?? ''} onChange={(e) => applyFilters({ status: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm">
                            <option value="">All statuses</option>
                            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </FilterBar>

                {facilities.data.length === 0 ? <EmptyState icon={Building2} title="No facilities yet" /> : <DataTable columns={columns} data={facilities.data} />}
                <Pagination links={facilities.links} />
            </div>

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Delete this facility?"
                confirmLabel="Delete"
                destructive
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => { if (deleteTarget) router.delete(route('admin.facilities.destroy', deleteTarget.id)); setDeleteTarget(null); }}
            />
        </AdminLayout>
    );
}
