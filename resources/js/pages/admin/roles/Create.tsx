import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';
import { fieldHelp } from '@/lib/admin-field-help';

interface PermissionGroup {
    label: string;
    permissions: string[];
}

export default function Create({ permissionGroups }: { permissionGroups: PermissionGroup[] }) {
    const { data, setData, post, processing, errors } = useForm<{ name: string; permissions: string[] }>({
        name: '', permissions: [],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.roles.store'));
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
            <Head title="New Role" />
            <PageHeader title="New Role" breadcrumbs={[{ label: 'Roles', href: route('admin.roles') }, { label: 'New' }]} />

            <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                <FormSection title="General">
                    <div>
                        <Label htmlFor="name">Role Name</Label>
                        <Input id="name" placeholder={fieldHelp('roles', 'name').example} value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1.5" autoFocus />
                        {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
                    </div>
                </FormSection>

                <FormSection title="Permissions" description="Grouped by module.">
                    <div className="space-y-5">
                        {permissionGroups.map((group) => {
                            const allChecked = group.permissions.every((p) => data.permissions.includes(p));

                            return (
                                <div key={group.label} className="rounded-lg border border-border p-4">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <input type="checkbox" checked={allChecked} onChange={(e) => toggleGroup(group, e.target.checked)} className="rounded border-border" />
                                        {group.label}
                                    </label>
                                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 pl-6 sm:grid-cols-3">
                                        {group.permissions.map((permission) => (
                                            <label key={permission} className="flex items-center gap-2 text-sm text-slate-700">
                                                <input type="checkbox" checked={data.permissions.includes(permission)} onChange={() => toggle(permission)} className="rounded border-border" />
                                                {permission}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={processing}>Create Role</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
