import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import Checkbox from '@/components/admin/Checkbox';
import InputError from '@/components/admin/InputError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/AuthLayout';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout>
            <Head title="Log in" />

            <h1 className="text-lg font-semibold text-foreground">Admin Sign In</h1>
            <p className="mt-1 text-sm text-slate-500">
                Sign in to manage site content.
            </p>

            {status && (
                <div className="mt-4 text-sm font-medium text-success">{status}</div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1.5"
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1.5"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', (e.target.checked || false) as false)
                            }
                        />
                        Remember me
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-slate-600 underline hover:text-navy-900"
                        >
                            Forgot your password?
                        </Link>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                    Log in
                </Button>
            </form>
        </AuthLayout>
    );
}
