import { Head, Link, router } from '@inertiajs/react';
import { Newspaper, Plus, Trash2 } from 'lucide-react';
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

interface CategoryRow {
    id: number;
    name: string;
    slug: string;
    articles_count: number;
}

export default function Index({
    categories,
    filters,
}: {
    categories: { data: CategoryRow[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { search?: string };
}) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);

    const applyFilters = (overrides: Partial<{ search: string }>) => {
        router.get(route('admin.news.categories'), { ...filters, ...overrides }, { preserveState: true, replace: true });
    };

    const columns: DataTableColumn<CategoryRow>[] = [
        { key: 'name', header: 'Name', render: (row) => <span className="font-medium text-foreground">{row.name}</span> },
        { key: 'articles_count', header: 'Articles', render: (row) => row.articles_count },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (row) => (
                <div className="flex justify-end gap-2">
                    {can('news.update') && (
                        <Link href={route('admin.news.categories.edit', row.id)}>
                            <Button size="sm" variant="secondary">Edit</Button>
                        </Link>
                    )}
                    {can('news.delete') && (
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
            <Head title="News Categories" />

            <PageHeader
                title="News Categories"
                description="Organize articles into categories."
                actions={
                    can('news.create') && (
                        <Link href={route('admin.news.categories.create')}>
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
                </FilterBar>

                {categories.data.length === 0 ? (
                    <EmptyState icon={Newspaper} title="No categories yet" />
                ) : (
                    <DataTable columns={columns} data={categories.data} />
                )}

                <Pagination links={categories.links} />
            </div>

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Delete this category?"
                description={`"${deleteTarget?.name}" cannot be deleted while it still has articles.`}
                confirmLabel="Delete"
                destructive
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (deleteTarget) router.delete(route('admin.news.categories.destroy', deleteTarget.id));
                    setDeleteTarget(null);
                }}
            />
        </AdminLayout>
    );
}
