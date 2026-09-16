import { Head, Link, router } from '@inertiajs/react';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
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

interface VacancyRow {
    id: number;
    title: string;
    slug: string;
    department: string | null;
    location: string | null;
    employment_type: string | null;
    status: string;
    closes_at: string | null;
    updated_at: string;
    deleted_at: string | null;
}

export default function Index({
    vacancies,
    filters,
    departments,
    statusOptions,
}: {
    vacancies: { data: VacancyRow[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { search?: string; department?: string; employment_type?: string; status?: string; trashed?: string };
    departments: string[];
    statusOptions: string[];
}) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<VacancyRow | null>(null);

    const applyFilters = (overrides: Record<string, unknown>) => {
        router.get(route('admin.careers'), { ...filters, ...overrides }, { preserveState: true, replace: true });
    };

    const columns: DataTableColumn<VacancyRow>[] = [
        {
            key: 'title', header: 'Position',
            render: (row) => (
                <div>
                    <p className="font-medium text-foreground">{row.title}</p>
                    <p className="text-xs text-slate-500">/careers/{row.slug}</p>
                </div>
            ),
        },
        { key: 'department', header: 'Department', render: (row) => row.department ?? '—' },
        { key: 'location', header: 'Location', render: (row) => row.location ?? '—' },
        { key: 'employment_type', header: 'Type', render: (row) => row.employment_type ?? '—' },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        { key: 'closes_at', header: 'Closes', render: (row) => row.closes_at ? new Date(row.closes_at).toLocaleDateString() : '—' },
        {
            key: 'actions', header: '', className: 'text-right',
            render: (row) =>
                row.deleted_at ? (
                    can('careers.manage') && (
                        <Button size="sm" variant="secondary" onClick={() => router.post(route('admin.careers.restore', row.id))}>Restore</Button>
                    )
                ) : (
                    <div className="flex justify-end gap-2">
                        {can('careers.manage') && (
                            <Link href={route('admin.careers.edit', row.id)}>
                                <Button size="sm" variant="secondary">Edit</Button>
                            </Link>
                        )}
                        {can('careers.manage') && (
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
            <Head title="Job Vacancies" />

            <PageHeader
                title="Job Vacancies"
                description="Manage open positions."
                actions={
                    can('careers.manage') && (
                        <Link href={route('admin.careers.create')}>
                            <Button><Plus className="mr-2 h-4 w-4" />New Vacancy</Button>
                        </Link>
                    )
                }
            />

            <div className="space-y-4">
                <FilterBar>
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                        placeholder="Search vacancies…"
                        className="max-w-sm"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <select value={filters.department ?? ''} onChange={(e) => applyFilters({ department: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm">
                            <option value="">All departments</option>
                            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select value={filters.status ?? ''} onChange={(e) => applyFilters({ status: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm">
                            <option value="">All statuses</option>
                            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <Button variant={filters.trashed ? 'primary' : 'secondary'} size="sm" onClick={() => applyFilters({ trashed: filters.trashed ? '' : '1' })}>
                            Trash
                        </Button>
                    </div>
                </FilterBar>

                {vacancies.data.length === 0 ? (
                    <EmptyState icon={Briefcase} title="No vacancies yet" action={can('careers.manage') && (
                        <Link href={route('admin.careers.create')}><Button size="sm">New Vacancy</Button></Link>
                    )} />
                ) : (
                    <DataTable columns={columns} data={vacancies.data} />
                )}

                <Pagination links={vacancies.links} />
            </div>

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Delete this vacancy?"
                description={`"${deleteTarget?.title}" will be moved to trash.`}
                confirmLabel="Delete"
                destructive
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (deleteTarget) router.delete(route('admin.careers.destroy', deleteTarget.id));
                    setDeleteTarget(null);
                }}
            />
        </AdminLayout>
    );
}
