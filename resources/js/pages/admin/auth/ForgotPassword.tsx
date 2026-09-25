import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/admin/InputError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/AuthLayout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <AuthLayout>
            <Head title="Forgot Password" />

            <h1 className="text-lg font-semibold text-foreground">Reset your password</h1>
            <p className="mt-1 text-sm text-slate-500">
                Enter your email address and we will send you a link to choose a new password.
            </p>

            {status && <div className="mt-4 text-sm font-medium text-success">{status}</div>}

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

                <Button type="submit" className="w-full" disabled={processing}>
                    Email Password Reset Link
                </Button>

                <p className="text-center">
                    <Link href={route('login')} className="text-sm text-slate-700 underline hover:text-navy-900">
                        Back to sign in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
