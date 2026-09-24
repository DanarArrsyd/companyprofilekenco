import { Head, Link, router } from '@inertiajs/react';
import { Plus, Users as UsersIcon } from 'lucide-react';
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
import AdminLayout from '@/layouts/AdminLayout';

interface UserRow {
    id: number;
    name: string;
    email: string;
    status: string;
    roles: { id: number; name: string }[];
}

export default function Index({
    users,
    filters,
    roles,
    statusOptions,
}: {
    users: { data: UserRow[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { search?: string; role?: string; status?: string };
    roles: string[];
    statusOptions: string[];
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusTarget, setStatusTarget] = useState<{ user: UserRow; next: string } | null>(null);

    const applyFilters = (overrides: Record<string, unknown>) => {
        router.get(route('admin.users'), { ...filters, ...overrides }, { preserveState: true, replace: true });
    };

    const columns: DataTableColumn<UserRow>[] = [
        {
            key: 'name', header: 'Name',
            render: (row) => (
                <div>
                    <p className="font-medium text-foreground">{row.name}</p>
                    <p className="text-xs text-slate-500">{row.email}</p>
                </div>
            ),
        },
        { key: 'roles', header: 'Roles', render: (row) => row.roles.map((r) => r.name).join(', ') || '—' },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        {
            key: 'actions', header: '', className: 'text-right',
            render: (row) => (
                <div className="flex justify-end gap-2">
                    <Link href={route('admin.users.edit', row.id)}>
                        <Button size="sm" variant="secondary">Edit</Button>
                    </Link>
                    {row.status === 'active' ? (
                        <Button size="sm" variant="danger" onClick={() => setStatusTarget({ user: row, next: 'suspended' })}>Suspend</Button>
                    ) : (
                        <Button size="sm" variant="secondary" onClick={() => setStatusTarget({ user: row, next: 'active' })}>Activate</Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>
            <Head title="Users" />

            <PageHeader
                title="Users"
                description="Manage admin user accounts."
                actions={
                    <Link href={route('admin.users.create')}>
                        <Button><Plus className="mr-2 h-4 w-4" />New User</Button>
                    </Link>
                }
            />

            <div className="space-y-6">
                <FilterBar>
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                        placeholder="Search name or email…"
                        className="max-w-sm"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <select value={filters.role ?? ''} onChange={(e) => applyFilters({ role: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm">
                            <option value="">All roles</option>
                            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <select value={filters.status ?? ''} onChange={(e) => applyFilters({ status: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm">
                            <option value="">All statuses</option>
                            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </FilterBar>

                {users.data.length === 0 ? (
                    <EmptyState icon={UsersIcon} title="No users yet" />
                ) : (
                    <DataTable columns={columns} data={users.data} />
                )}

                <Pagination links={users.links} />
            </div>

            <ConfirmDialog
                open={statusTarget !== null}
                title={statusTarget?.next === 'suspended' ? 'Suspend this user?' : 'Activate this user?'}
                description={statusTarget?.next === 'suspended' ? `"${statusTarget?.user.name}" will no longer be able to log in.` : `"${statusTarget?.user.name}" will regain access.`}
                confirmLabel={statusTarget?.next === 'suspended' ? 'Suspend' : 'Activate'}
                destructive={statusTarget?.next === 'suspended'}
                onCancel={() => setStatusTarget(null)}
                onConfirm={() => {
                    if (statusTarget) {
                        router.put(route('admin.users.status', statusTarget.user.id), { status: statusTarget.next }, { preserveScroll: true });
                    }
                    setStatusTarget(null);
                }}
            />
        </AdminLayout>
    );
}
