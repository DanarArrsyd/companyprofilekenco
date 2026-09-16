import { Head, Link, router } from '@inertiajs/react';
import { Plus, ShieldCheck, Trash2 } from 'lucide-react';
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
    id: number; title: string; slug: string; status: string;
}

export default function Index({
    items, filters, statusOptions,
}: {
    items: { data: Row[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { search?: string; status?: string };
    statusOptions: string[];
}) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

    const applyFilters = (overrides: Record<string, unknown>) => {
        router.get(route('admin.quality-content'), { ...filters, ...overrides }, { preserveState: true, replace: true });
    };

    const columns: DataTableColumn<Row>[] = [
        { key: 'title', header: 'Title', render: (row) => <span className="font-medium text-foreground">{row.title}</span> },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        {
            key: 'actions', header: '', className: 'text-right',
            render: (row) => (
                <div className="flex justify-end gap-2">
                    {can('certifications.update') && <Link href={route('admin.quality-content.edit', row.id)}><Button size="sm" variant="secondary">Edit</Button></Link>}
                    {can('certifications.delete') && <Button size="sm" variant="danger" onClick={() => setDeleteTarget(row)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>
            <Head title="Quality Content" />
            <PageHeader
                title="Quality Content"
                description="Manage quality-related content blocks."
                actions={can('certifications.create') && <Link href={route('admin.quality-content.create')}><Button><Plus className="mr-2 h-4 w-4" />New Content</Button></Link>}
            />

            <div className="space-y-4">
                <FilterBar>
                    <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })} placeholder="Search…" className="max-w-sm" />
                    <select value={filters.status ?? ''} onChange={(e) => applyFilters({ status: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm">
                        <option value="">All statuses</option>
                        {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </FilterBar>

                {items.data.length === 0 ? <EmptyState icon={ShieldCheck} title="No quality content yet" /> : <DataTable columns={columns} data={items.data} />}
                <Pagination links={items.links} />
            </div>

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Delete this content?"
                confirmLabel="Delete"
                destructive
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => { if (deleteTarget) router.delete(route('admin.quality-content.destroy', deleteTarget.id)); setDeleteTarget(null); }}
            />
        </AdminLayout>
    );
}
