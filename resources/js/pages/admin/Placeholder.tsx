import { Head } from '@inertiajs/react';
import { Construction } from 'lucide-react';

import { EmptyState } from '@/components/admin/EmptyState';
import { PageHeader } from '@/components/admin/PageHeader';
import AdminLayout from '@/layouts/AdminLayout';

export default function Placeholder({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    return (
        <AdminLayout>
            <Head title={title} />

            <PageHeader title={title} description={description} />

            <EmptyState
                icon={Construction}
                title="Module foundation ready"
                description="This module's management screens will be built in a later phase."
            />
        </AdminLayout>
    );
}
