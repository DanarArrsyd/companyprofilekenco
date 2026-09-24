import { Head, Link, router } from '@inertiajs/react';
import { Factory, Plus, Star, Trash2 } from 'lucide-react';
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

interface CapabilityRow {
    id: number;
    name: string;
    slug: string;
    status: string;
    is_featured: boolean;
    deleted_at: string | null;
}

export default function Index({
    capabilities,
    filters,
    statusOptions,
}: {
    capabilities: { data: CapabilityRow[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { search?: string; status?: string; featured?: string; trashed?: string };
    statusOptions: string[];
}) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<CapabilityRow | null>(null);

    const applyFilters = (overrides: Record<string, unknown>) => {
        router.get(route('admin.capabilities'), { ...filters, ...overrides }, { preserveState: true, replace: true });
    };

    const columns: DataTableColumn<CapabilityRow>[] = [
        {
            key: 'name',
            header: 'Name',
            render: (row) => (
                <div className="flex items-center gap-2">
                    {row.is_featured && <Star className="h-3.5 w-3.5 fill-warning text-warning" />}
                    <span className="font-medium text-foreground">{row.name}</span>
                </div>
            ),
        },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (row) =>
                row.deleted_at ? (
                    can('capabilities.delete') && (
                        <Button size="sm" variant="secondary" onClick={() => router.post(route('admin.capabilities.restore', row.id))}>Restore</Button>
                    )
                ) : (
                    <div className="flex justify-end gap-2">
                        {can('capabilities.update') && (
                            <Link href={route('admin.capabilities.edit', row.id)}>
                                <Button size="sm" variant="secondary">Edit</Button>
                            </Link>
                        )}
                        {can('capabilities.delete') && (
                            <Button size="sm" variant="danger" onClick={() => setDeleteTarget(row)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ),
        },
    ];

    return (
        <AdminLayout>
            <Head title="Capabilities" />

            <PageHeader
                title="Capabilities"
                description="Manage manufacturing capabilities."
                actions={
                    can('capabilities.create') && (
                        <Link href={route('admin.capabilities.create')}>
                            <Button><Plus className="mr-2 h-4 w-4" />New Capability</Button>
                        </Link>
                    )
                }
            />

            <div className="space-y-6">
                <FilterBar>
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                        placeholder="Search capabilities…"
                        className="max-w-sm"
                    />
                    <div className="flex items-center gap-2">
                        <select value={filters.status ?? ''} onChange={(e) => applyFilters({ status: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm">
                            <option value="">All statuses</option>
                            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <Button variant={filters.featured ? 'primary' : 'secondary'} size="sm" onClick={() => applyFilters({ featured: filters.featured ? '' : '1' })}>Featured</Button>
                        <Button variant={filters.trashed ? 'primary' : 'secondary'} size="sm" onClick={() => applyFilters({ trashed: filters.trashed ? '' : '1' })}>Trash</Button>
                    </div>
                </FilterBar>

                {capabilities.data.length === 0 ? (
                    <EmptyState icon={Factory} title="No capabilities yet" />
                ) : (
                    <DataTable columns={columns} data={capabilities.data} />
                )}

                <Pagination links={capabilities.links} />
            </div>

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Delete this capability?"
                confirmLabel="Delete"
                destructive
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (deleteTarget) router.delete(route('admin.capabilities.destroy', deleteTarget.id));
                    setDeleteTarget(null);
                }}
            />
        </AdminLayout>
    );
}
