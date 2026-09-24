import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, Award, Plus, Trash2 } from 'lucide-react';
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

interface CertRow {
    id: number; name: string; issuer: string | null; expires_at: string | null; status: string;
}

function isExpired(expiresAt: string | null): boolean {
    return !!expiresAt && new Date(expiresAt) < new Date();
}

export default function Index({
    certifications, filters, statusOptions,
}: {
    certifications: { data: CertRow[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { search?: string; status?: string };
    statusOptions: string[];
}) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<CertRow | null>(null);

    const applyFilters = (overrides: Record<string, unknown>) => {
        router.get(route('admin.certifications'), { ...filters, ...overrides }, { preserveState: true, replace: true });
    };

    const columns: DataTableColumn<CertRow>[] = [
        {
            key: 'name', header: 'Name',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{row.name}</span>
                    {isExpired(row.expires_at) && (
                        <span className="inline-flex items-center gap-1 rounded bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
                            <AlertTriangle className="h-3 w-3" />
                            Expired
                        </span>
                    )}
                </div>
            ),
        },
        { key: 'issuer', header: 'Issuer', render: (row) => row.issuer ?? '—' },
        { key: 'expires_at', header: 'Expires', render: (row) => row.expires_at ? new Date(row.expires_at).toLocaleDateString() : '—' },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        {
            key: 'actions', header: '', className: 'text-right',
            render: (row) => (
                <div className="flex justify-end gap-2">
                    {can('certifications.update') && <Link href={route('admin.certifications.edit', row.id)}><Button size="sm" variant="secondary">Edit</Button></Link>}
                    {can('certifications.delete') && <Button size="sm" variant="danger" onClick={() => setDeleteTarget(row)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>
            <Head title="Certifications" />
            <PageHeader
                title="Certifications"
                description="Manage quality certifications."
                actions={can('certifications.create') && <Link href={route('admin.certifications.create')}><Button><Plus className="mr-2 h-4 w-4" />New Certification</Button></Link>}
            />

            <div className="space-y-6">
                <FilterBar>
                    <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })} placeholder="Search certifications…" className="max-w-sm" />
                    <select value={filters.status ?? ''} onChange={(e) => applyFilters({ status: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm">
                        <option value="">All statuses</option>
                        {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </FilterBar>

                {certifications.data.length === 0 ? <EmptyState icon={Award} title="No certifications yet" /> : <DataTable columns={columns} data={certifications.data} />}
                <Pagination links={certifications.links} />
            </div>

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Delete this certification?"
                confirmLabel="Delete"
                destructive
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => { if (deleteTarget) router.delete(route('admin.certifications.destroy', deleteTarget.id)); setDeleteTarget(null); }}
            />
        </AdminLayout>
    );
}
