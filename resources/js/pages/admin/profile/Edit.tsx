import { Head } from '@inertiajs/react';

import { PageHeader } from '@/components/admin/PageHeader';
import AdminLayout from '@/layouts/AdminLayout';
import { PageProps } from '@/types';

import DeleteUserForm from './partials/DeleteUserForm';
import UpdatePasswordForm from './partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AdminLayout>
            <Head title="Profile" />

            <PageHeader title="Profile" description="Manage your account information and password." />

            <div className="space-y-6">
                <div className="rounded-lg border border-border bg-surface p-6 sm:p-8">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="rounded-lg border border-border bg-surface p-6 sm:p-8">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                <div className="rounded-lg border border-border bg-surface p-6 sm:p-8">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </AdminLayout>
    );
}
