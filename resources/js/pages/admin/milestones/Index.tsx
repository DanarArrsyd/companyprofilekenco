import { Head, Link, router } from '@inertiajs/react';
import { Flag, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { DataTable, DataTableColumn } from '@/components/admin/DataTable';
import { EmptyState } from '@/components/admin/EmptyState';
import { FilterBar } from '@/components/admin/FilterBar';
import { PageHeader } from '@/components/admin/PageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { SearchInput } from '@/components/admin/SearchInput';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import AdminLayout from '@/layouts/AdminLayout';

interface Row {
    id: number;
    year: number;
    title: string;
    description: string | null;
    image: string | null;
    order: number;
    updated_at: string;
}

export default function Index({
    milestones, filters,
}: {
    milestones: { data: Row[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { search?: string };
}) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

    const applyFilters = (overrides: Record<string, unknown>) => {
        router.get(route('admin.milestones'), { ...filters, ...overrides }, { preserveState: true, replace: true });
    };

    const columns: DataTableColumn<Row>[] = [
        {
            key: 'image', header: '', className: 'w-16',
            render: (row) => row.image
                ? <img src={`/storage/${row.image}`} alt="" className="h-12 w-12 rounded-sm border border-border object-cover" />
                : <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-dashed border-border text-[10px] text-slate-400">None</div>,
        },
        { key: 'year', header: 'Year', render: (row) => <span className="font-semibold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.year}</span> },
        {
            key: 'title', header: 'Title',
            render: (row) => (
                <div>
                    <p className="font-medium text-foreground">{row.title}</p>
                    {row.description && <p className="mt-0.5 max-w-sm truncate text-xs text-slate-500">{row.description}</p>}
                </div>
            ),
        },
        { key: 'order', header: 'Sort Order', render: (row) => <span className="text-slate-600" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.order}</span> },
        { key: 'updated_at', header: 'Updated', render: (row) => <span className="text-slate-500">{new Date(row.updated_at).toLocaleDateString()}</span> },
        {
            key: 'actions', header: '', className: 'text-right',
            render: (row) => (
                <div className="flex justify-end gap-2">
                    {can('milestones.update') && <Link href={route('admin.milestones.edit', row.id)}><Button size="sm" variant="secondary">Edit</Button></Link>}
                    {can('milestones.delete') && <Button size="sm" variant="danger" onClick={() => setDeleteTarget(row)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>
            <Head title="Milestones" />
            <PageHeader
                title="Milestones"
                description="Manage the company milestones timeline shown on the homepage."
                actions={can('milestones.create') && <Link href={route('admin.milestones.create')}><Button><Plus className="mr-2 h-4 w-4" />New Milestone</Button></Link>}
            />

            <div className="space-y-6">
                <FilterBar>
                    <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })} placeholder="Search milestones…" className="max-w-sm" />
                </FilterBar>

                {milestones.data.length === 0 ? <EmptyState icon={Flag} title="No milestones yet" /> : <DataTable columns={columns} data={milestones.data} />}
                <Pagination links={milestones.links} />
            </div>

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Delete this milestone?"
                confirmLabel="Delete"
                destructive
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => { if (deleteTarget) router.delete(route('admin.milestones.destroy', deleteTarget.id)); setDeleteTarget(null); }}
            />
        </AdminLayout>
    );
}
