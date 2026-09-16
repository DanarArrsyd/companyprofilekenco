import { Head, Link, router } from '@inertiajs/react';
import { Boxes, Plus, Star, Trash2 } from 'lucide-react';
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

interface ProductRow {
    id: number;
    name: string;
    slug: string;
    status: string;
    is_featured: boolean;
    updated_at: string;
    deleted_at: string | null;
    category: { id: number; name: string } | null;
}

export default function Index({
    products,
    filters,
    categories,
    statusOptions,
}: {
    products: { data: ProductRow[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { search?: string; category?: string; status?: string; featured?: string; trashed?: string };
    categories: { id: number; name: string }[];
    statusOptions: string[];
}) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);

    const applyFilters = (overrides: Record<string, unknown>) => {
        router.get(route('admin.products'), { ...filters, ...overrides }, { preserveState: true, replace: true });
    };

    const columns: DataTableColumn<ProductRow>[] = [
        {
            key: 'name',
            header: 'Name',
            render: (row) => (
                <div className="flex items-center gap-2">
                    {row.is_featured && <Star className="h-3.5 w-3.5 fill-warning text-warning" />}
                    <div>
                        <p className="font-medium text-foreground">{row.name}</p>
                        <p className="text-xs text-slate-500">/{row.slug}</p>
                    </div>
                </div>
            ),
        },
        { key: 'category', header: 'Category', render: (row) => row.category?.name ?? '—' },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        { key: 'updated_at', header: 'Updated', render: (row) => new Date(row.updated_at).toLocaleDateString() },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (row) =>
                row.deleted_at ? (
                    can('products.delete') && (
                        <Button size="sm" variant="secondary" onClick={() => router.post(route('admin.products.restore', row.id))}>
                            Restore
                        </Button>
                    )
                ) : (
                    <div className="flex justify-end gap-2">
                        {can('products.update') && (
                            <Link href={route('admin.products.edit', row.id)}>
                                <Button size="sm" variant="secondary">Edit</Button>
                            </Link>
                        )}
                        {can('products.delete') && (
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
            <Head title="Products" />

            <PageHeader
                title="Products"
                description="Manage the product catalog."
                actions={
                    can('products.create') && (
                        <Link href={route('admin.products.create')}>
                            <Button><Plus className="mr-2 h-4 w-4" />New Product</Button>
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
                        placeholder="Search products…"
                        className="max-w-sm"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <select value={filters.category ?? ''} onChange={(e) => applyFilters({ category: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm">
                            <option value="">All categories</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select value={filters.status ?? ''} onChange={(e) => applyFilters({ status: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm">
                            <option value="">All statuses</option>
                            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <Button variant={filters.featured ? 'primary' : 'secondary'} size="sm" onClick={() => applyFilters({ featured: filters.featured ? '' : '1' })}>
                            Featured
                        </Button>
                        <Button variant={filters.trashed ? 'primary' : 'secondary'} size="sm" onClick={() => applyFilters({ trashed: filters.trashed ? '' : '1' })}>
                            Trash
                        </Button>
                    </div>
                </FilterBar>

                {products.data.length === 0 ? (
                    <EmptyState icon={Boxes} title="No products yet" action={can('products.create') && (
                        <Link href={route('admin.products.create')}><Button size="sm">New Product</Button></Link>
                    )} />
                ) : (
                    <DataTable columns={columns} data={products.data} />
                )}

                <Pagination links={products.links} />
            </div>

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Delete this product?"
                description={`"${deleteTarget?.name}" will be moved to trash.`}
                confirmLabel="Delete"
                destructive
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (deleteTarget) router.delete(route('admin.products.destroy', deleteTarget.id));
                    setDeleteTarget(null);
                }}
            />
        </AdminLayout>
    );
}
