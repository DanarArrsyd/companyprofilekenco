import { Head, Link, router } from '@inertiajs/react';
import { Newspaper, Plus, Star, Trash2 } from 'lucide-react';
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

interface ArticleRow {
    id: number;
    title: string;
    slug: string;
    status: string;
    is_featured: boolean;
    published_at: string | null;
    updated_at: string;
    deleted_at: string | null;
    category: { id: number; name: string } | null;
    author: { id: number; name: string } | null;
}

export default function Index({
    articles,
    filters,
    categories,
    statusOptions,
}: {
    articles: { data: ArticleRow[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { search?: string; category?: string; status?: string; featured?: string; trashed?: string };
    categories: { id: number; name: string }[];
    statusOptions: string[];
}) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<ArticleRow | null>(null);

    const applyFilters = (overrides: Record<string, unknown>) => {
        router.get(route('admin.news'), { ...filters, ...overrides }, { preserveState: true, replace: true });
    };

    const columns: DataTableColumn<ArticleRow>[] = [
        {
            key: 'title',
            header: 'Title',
            render: (row) => (
                <div className="flex items-center gap-2">
                    {row.is_featured && <Star className="h-3.5 w-3.5 fill-warning text-warning" />}
                    <div>
                        <p className="font-medium text-foreground">{row.title}</p>
                        <p className="text-xs text-slate-500">/news/{row.slug}</p>
                    </div>
                </div>
            ),
        },
        { key: 'category', header: 'Category', render: (row) => row.category?.name ?? '—' },
        { key: 'author', header: 'Author', render: (row) => row.author?.name ?? '—' },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        { key: 'updated_at', header: 'Updated', render: (row) => new Date(row.updated_at).toLocaleDateString() },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (row) =>
                row.deleted_at ? (
                    can('news.delete') && (
                        <Button size="sm" variant="secondary" onClick={() => router.post(route('admin.news.restore', row.id))}>
                            Restore
                        </Button>
                    )
                ) : (
                    <div className="flex justify-end gap-2">
                        {can('news.view') && (
                            <a href={route('admin.news.preview', row.id)} target="_blank" rel="noreferrer">
                                <Button size="sm" variant="secondary">Preview</Button>
                            </a>
                        )}
                        {can('news.update') && (
                            <Link href={route('admin.news.edit', row.id)}>
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
            <Head title="Articles" />

            <PageHeader
                title="Articles"
                description="Manage news articles."
                actions={
                    can('news.create') && (
                        <Link href={route('admin.news.create')}>
                            <Button><Plus className="mr-2 h-4 w-4" />New Article</Button>
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
                        placeholder="Search articles…"
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

                {articles.data.length === 0 ? (
                    <EmptyState icon={Newspaper} title="No articles yet" action={can('news.create') && (
                        <Link href={route('admin.news.create')}><Button size="sm">New Article</Button></Link>
                    )} />
                ) : (
                    <DataTable columns={columns} data={articles.data} />
                )}

                <Pagination links={articles.links} />
            </div>

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Delete this article?"
                description={`"${deleteTarget?.title}" will be moved to trash.`}
                confirmLabel="Delete"
                destructive
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (deleteTarget) router.delete(route('admin.news.destroy', deleteTarget.id));
                    setDeleteTarget(null);
                }}
            />
        </AdminLayout>
    );
}
