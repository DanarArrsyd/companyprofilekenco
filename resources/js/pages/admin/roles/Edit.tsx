import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/AdminLayout';

interface PermissionGroup {
    label: string;
    permissions: string[];
}

interface RoleDetail {
    id: number;
    name: string;
    permissions: string[];
}

export default function Edit({
    role,
    permissionGroups,
    isProtected,
}: {
    role: RoleDetail;
    permissionGroups: PermissionGroup[];
    isProtected: boolean;
}) {
    const { data, setData, put, processing, errors } = useForm<{ permissions: string[] }>({
        permissions: role.permissions,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.roles.update', role.id));
    };

    const toggle = (permission: string) => {
        setData('permissions', data.permissions.includes(permission) ? data.permissions.filter((p) => p !== permission) : [...data.permissions, permission]);
    };

    const toggleGroup = (group: PermissionGroup, checked: boolean) => {
        const rest = data.permissions.filter((p) => !group.permissions.includes(p));
        setData('permissions', checked ? [...rest, ...group.permissions] : rest);
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${role.name}`} />
            <PageHeader title={role.name} breadcrumbs={[{ label: 'Roles', href: route('admin.roles') }, { label: 'Edit' }]} />

            {isProtected && (
                <div className="mb-4 rounded border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
                    Super Admin permissions are locked to guarantee the system always has full administrative access.
                </div>
            )}

            <form onSubmit={submit} className="rounded border border-border bg-surface px-6">
                {errors.permissions && <p className="pt-4 text-sm text-danger">{errors.permissions}</p>}

                <FormSection title="Permissions" description="Grouped by module.">
                    <div className="space-y-5">
                        {permissionGroups.map((group) => {
                            const allChecked = group.permissions.every((p) => data.permissions.includes(p));

                            return (
                                <div key={group.label} className="rounded border border-border p-3">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <input type="checkbox" disabled={isProtected} checked={allChecked} onChange={(e) => toggleGroup(group, e.target.checked)} className="rounded border-border" />
                                        {group.label}
                                    </label>
                                    <div className="mt-2 grid grid-cols-2 gap-2 pl-6 sm:grid-cols-3">
                                        {group.permissions.map((permission) => (
                                            <label key={permission} className="flex items-center gap-2 text-sm text-slate-700">
                                                <input type="checkbox" disabled={isProtected} checked={data.permissions.includes(permission)} onChange={() => toggle(permission)} className="rounded border-border" />
                                                {permission}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </FormSection>

                {!isProtected && (
                    <FormActions>
                        <Button type="submit" disabled={processing}>Save Permissions</Button>
                    </FormActions>
                )}
            </form>
        </AdminLayout>
    );
}
