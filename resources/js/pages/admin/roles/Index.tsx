import { Head, Link, router } from '@inertiajs/react';
import { Plus, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { DataTable, DataTableColumn } from '@/components/admin/DataTable';
import { EmptyState } from '@/components/admin/EmptyState';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/AdminLayout';

interface RoleRow {
    id: number;
    name: string;
    users_count: number;
}

export default function Index({ roles, systemRoles }: { roles: RoleRow[]; systemRoles: string[] }) {
    const [deleteTarget, setDeleteTarget] = useState<RoleRow | null>(null);

    const columns: DataTableColumn<RoleRow>[] = [
        {
            key: 'name', header: 'Role',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{row.name}</span>
                    {systemRoles.includes(row.name) && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-slate-500">System</span>
                    )}
                </div>
            ),
        },
        { key: 'users_count', header: 'Users', render: (row) => row.users_count },
        {
            key: 'actions', header: '', className: 'text-right',
            render: (row) => (
                <div className="flex justify-end gap-2">
                    <Link href={route('admin.roles.edit', row.id)}>
                        <Button size="sm" variant="secondary">Edit</Button>
                    </Link>
                    {!systemRoles.includes(row.name) && (
                        <Button size="sm" variant="danger" onClick={() => setDeleteTarget(row)}>Delete</Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>
            <Head title="Roles" />

            <PageHeader
                title="Roles"
                description="Manage roles and their permissions."
                actions={
                    <Link href={route('admin.roles.create')}>
                        <Button><Plus className="mr-2 h-4 w-4" />New Role</Button>
                    </Link>
                }
            />

            {roles.length === 0 ? (
                <EmptyState icon={ShieldCheck} title="No roles yet" />
            ) : (
                <DataTable columns={columns} data={roles} />
            )}

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Delete this role?"
                description={`"${deleteTarget?.name}" will be permanently removed. It must not be assigned to any user.`}
                confirmLabel="Delete"
                destructive
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (deleteTarget) router.delete(route('admin.roles.destroy', deleteTarget.id));
                    setDeleteTarget(null);
                }}
            />
        </AdminLayout>
    );
}
