import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';

export default function Create({ roles }: { roles: string[] }) {
    const { data, setData, post, processing, errors } = useForm<{
        name: string; email: string; password: string; password_confirmation: string; roles: string[];
    }>({
        name: '', email: '', password: '', password_confirmation: '', roles: [],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.users.store'));
    };

    const toggleRole = (role: string) => {
        setData('roles', data.roles.includes(role) ? data.roles.filter((r) => r !== role) : [...data.roles, role]);
    };

    return (
        <AdminLayout>
            <Head title="New User" />
            <PageHeader title="New User" breadcrumbs={[{ label: 'Users', href: route('admin.users') }, { label: 'New' }]} />

            <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                <FormSection title="Account">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1.5" autoFocus />
                        {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="mt-1.5" />
                        {errors.email && <p className="mt-1 text-sm text-danger">{errors.email}</p>}
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="mt-1.5" />
                        {errors.password && <p className="mt-1 text-sm text-danger">{errors.password}</p>}
                    </div>
                    <div>
                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                        <Input id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} className="mt-1.5" />
                    </div>
                </FormSection>

                <FormSection title="Roles">
                    <div className="space-y-2">
                        {roles.map((role) => (
                            <label key={role} className="flex items-center gap-2 text-sm text-slate-700">
                                <input type="checkbox" checked={data.roles.includes(role)} onChange={() => toggleRole(role)} className="rounded border-border" />
                                {role}
                            </label>
                        ))}
                    </div>
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={processing}>Create User</Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
