import { Head, Link, router } from '@inertiajs/react';
import { Boxes, Plus, Trash2 } from 'lucide-react';
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

interface CategoryRow {
    id: number;
    name: string;
    slug: string;
    status: string;
    facilities_count: number;
}

export default function Index({
    categories,
    filters,
    statusOptions,
}: {
    categories: { data: CategoryRow[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { search?: string; status?: string };
    statusOptions: string[];
}) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);

    const applyFilters = (overrides: Partial<{ search: string; status: string }>) => {
        router.get(route('admin.facilities.categories'), { ...filters, ...overrides }, { preserveState: true, replace: true });
    };

    const columns: DataTableColumn<CategoryRow>[] = [
        { key: 'name', header: 'Name', render: (row) => <span className="font-medium text-foreground">{row.name}</span> },
        { key: 'facilities_count', header: 'Facilities', render: (row) => row.facilities_count },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (row) => (
                <div className="flex justify-end gap-2">
                    {can('facilities.update') && (
                        <Link href={route('admin.facilities.categories.edit', row.id)}>
                            <Button size="sm" variant="secondary">Edit</Button>
                        </Link>
                    )}
                    {can('facilities.delete') && (
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
            <Head title="Facility Categories" />

            <PageHeader
                title="Facility Categories"
                description="Organize facilities into categories."
                actions={
                    can('facilities.create') && (
                        <Link href={route('admin.facilities.categories.create')}>
                            <Button><Plus className="mr-2 h-4 w-4" />New Category</Button>
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
                        placeholder="Search categories…"
                        className="max-w-sm"
                    />
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilters({ status: e.target.value })}
                        className="h-10 rounded border border-border bg-surface px-3 text-sm"
                    >
                        <option value="">All statuses</option>
                        {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </FilterBar>

                {categories.data.length === 0 ? (
                    <EmptyState icon={Boxes} title="No categories yet" />
                ) : (
                    <DataTable columns={columns} data={categories.data} />
                )}

                <Pagination links={categories.links} />
            </div>

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Delete this category?"
                description={`Facilities in "${deleteTarget?.name}" will become uncategorized.`}
                confirmLabel="Delete"
                destructive
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (deleteTarget) router.delete(route('admin.facilities.categories.destroy', deleteTarget.id));
                    setDeleteTarget(null);
                }}
            />
        </AdminLayout>
    );
}
