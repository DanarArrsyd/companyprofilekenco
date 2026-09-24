import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';

interface UserDetail {
    id: number; name: string; email: string; status: string; roles: string[];
    last_login_at: string | null; created_at: string;
}

export default function Edit({ user, roles, isSelf }: { user: UserDetail; roles: string[]; isSelf: boolean }) {
    const { data, setData, put, processing, errors } = useForm<{ name: string; email: string; roles: string[] }>({
        name: user.name, email: user.email, roles: user.roles,
    });

    const passwordForm = useForm<{ mode: 'manual' | 'generate'; password: string; password_confirmation: string }>({
        mode: 'generate', password: '', password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id));
    };

    const submitPassword: FormEventHandler = (e) => {
        e.preventDefault();
        passwordForm.put(route('admin.users.password', user.id), { preserveScroll: true });
    };

    const toggleRole = (role: string) => {
        setData('roles', data.roles.includes(role) ? data.roles.filter((r) => r !== role) : [...data.roles, role]);
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${user.name}`} />
            <PageHeader
                title={user.name}
                breadcrumbs={[{ label: 'Users', href: route('admin.users') }, { label: 'Edit' }]}
                actions={<StatusBadge status={user.status} />}
            />

            <div className="space-y-6">
                <form onSubmit={submit} className="rounded-lg border border-border bg-surface px-6 sm:px-8">
                    <FormSection title="Account">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1.5" />
                            {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="mt-1.5" />
                            {errors.email && <p className="mt-1 text-sm text-danger">{errors.email}</p>}
                        </div>
                        <div>
                            <Label>Last login</Label>
                            <p className="mt-1.5 text-sm text-slate-600">{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</p>
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
                        <Button type="submit" disabled={processing}>Save Changes</Button>
                    </FormActions>
                </form>

                <form onSubmit={submitPassword} className="rounded-lg border border-border bg-surface p-6 sm:p-8">
                    <h2 className="text-base font-semibold text-foreground">Password</h2>
                    <div className="mt-5 space-y-5">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="radio" checked={passwordForm.data.mode === 'generate'} onChange={() => passwordForm.setData('mode', 'generate')} />
                            Generate a temporary password (shown once)
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="radio" checked={passwordForm.data.mode === 'manual'} onChange={() => passwordForm.setData('mode', 'manual')} />
                            Set a specific password
                        </label>

                        {passwordForm.data.mode === 'manual' && (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="new_password">New password</Label>
                                    <Input id="new_password" type="password" value={passwordForm.data.password} onChange={(e) => passwordForm.setData('password', e.target.value)} className="mt-1.5" />
                                    {passwordForm.errors.password && <p className="mt-1 text-sm text-danger">{passwordForm.errors.password}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="new_password_confirmation">Confirm password</Label>
                                    <Input id="new_password_confirmation" type="password" value={passwordForm.data.password_confirmation} onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)} className="mt-1.5" />
                                </div>
                            </div>
                        )}

                        <Button type="submit" size="sm" disabled={passwordForm.processing}>Update Password</Button>
                    </div>
                </form>

                {isSelf && (
                    <p className="text-sm text-slate-500">This is your own account — you cannot suspend it from here.</p>
                )}
            </div>
        </AdminLayout>
    );
}
