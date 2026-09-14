import { Head, Link, router } from '@inertiajs/react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

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

interface PageRow {
    id: number;
    title: string;
    slug: string;
    status: string;
    updated_at: string;
    deleted_at: string | null;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

export default function Index({
    pages,
    filters,
    statusOptions,
}: {
    pages: Paginated<PageRow>;
    filters: { search?: string; status?: string; trashed?: boolean };
    statusOptions: string[];
}) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<PageRow | null>(null);

    const applyFilters = (overrides: Partial<{ search: string; status: string; trashed: boolean }>) => {
        router.get(
            route('admin.pages'),
            { ...filters, ...overrides },
            { preserveState: true, replace: true },
        );
    };

    const submitSearch = (e: FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const columns: DataTableColumn<PageRow>[] = [
        {
            key: 'title',
            header: 'Title',
            render: (row) => (
                <div>
                    <p className="font-medium text-foreground">{row.title}</p>
                    <p className="text-xs text-slate-500">/{row.slug}</p>
                </div>
            ),
        },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        {
            key: 'updated_at',
            header: 'Updated',
            render: (row) => new Date(row.updated_at).toLocaleDateString(),
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (row) =>
                row.deleted_at ? (
                    can('pages.delete') && (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => router.post(route('admin.pages.restore', row.id))}
                        >
                            Restore
                        </Button>
                    )
                ) : (
                    <div className="flex justify-end gap-2">
                        {can('pages.update') && (
                            <Link href={route('admin.pages.edit', row.id)}>
                                <Button size="sm" variant="secondary">
                                    Edit
                                </Button>
                            </Link>
                        )}
                        {can('pages.delete') && (
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
            <Head title="Pages" />

            <PageHeader
                title="Pages"
                description="Manage structured content pages."
                actions={
                    can('pages.create') && (
                        <Link href={route('admin.pages.create')}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Page
                            </Button>
                        </Link>
                    )
                }
            />

            <div className="space-y-4">
                <FilterBar>
                    <form onSubmit={submitSearch} className="w-full max-w-sm">
                        <SearchInput
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search title or slug…"
                        />
                    </form>

                    <div className="flex items-center gap-2">
                        <select
                            value={filters.status ?? ''}
                            onChange={(e) => applyFilters({ status: e.target.value })}
                            className="h-10 rounded border border-border bg-surface px-3 text-sm"
                        >
                            <option value="">All statuses</option>
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>

                        <Button
                            variant={filters.trashed ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => applyFilters({ trashed: !filters.trashed })}
                        >
                            Trash
                        </Button>
                    </div>
                </FilterBar>

                {pages.data.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title={filters.trashed ? 'No trashed pages' : 'No pages yet'}
                        description={filters.trashed ? undefined : 'Create your first structured content page.'}
                        action={
                            !filters.trashed &&
                            can('pages.create') && (
                                <Link href={route('admin.pages.create')}>
                                    <Button size="sm">New Page</Button>
                                </Link>
                            )
                        }
                    />
                ) : (
                    <DataTable columns={columns} data={pages.data} />
                )}

                <Pagination links={pages.links} />
            </div>

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Delete this page?"
                description={`"${deleteTarget?.title}" will be moved to trash and can be restored later.`}
                confirmLabel="Delete"
                destructive
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (deleteTarget) {
                        router.delete(route('admin.pages.destroy', deleteTarget.id));
                    }
                    setDeleteTarget(null);
                }}
            />
        </AdminLayout>
    );
}
