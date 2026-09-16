import { Head, router } from '@inertiajs/react';
import { Mail } from 'lucide-react';

import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';

interface Inquiry {
    id: number;
    name: string;
    company: string | null;
    email: string;
    phone: string | null;
    subject: string | null;
    message: string;
    status: string;
    created_at: string;
}

export default function Show({ inquiry, statusOptions }: { inquiry: Inquiry; statusOptions: string[] }) {
    const updateStatus = (status: string) => {
        router.put(route('admin.inquiries.status', inquiry.id), { status }, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <Head title={`Inquiry - ${inquiry.name}`} />

            <PageHeader
                title={inquiry.name}
                description={inquiry.subject ?? 'Contact inquiry'}
                breadcrumbs={[{ label: 'Inquiries', href: route('admin.inquiries') }, { label: inquiry.name }]}
                actions={<StatusBadge status={inquiry.status} />}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-4 rounded border border-border bg-surface p-6 lg:col-span-2">
                    <div>
                        <Label>Company</Label>
                        <p className="mt-1 text-sm text-foreground">{inquiry.company ?? '—'}</p>
                    </div>
                    <div>
                        <Label>Email</Label>
                        <p className="mt-1 text-sm text-foreground">{inquiry.email}</p>
                    </div>
                    <div>
                        <Label>Phone</Label>
                        <p className="mt-1 text-sm text-foreground">{inquiry.phone ?? '—'}</p>
                    </div>
                    <div>
                        <Label>Message</Label>
                        <p className="mt-1 whitespace-pre-line text-sm text-foreground">{inquiry.message}</p>
                    </div>
                    <div>
                        <Label>Received</Label>
                        <p className="mt-1 text-sm text-foreground">{new Date(inquiry.created_at).toLocaleString()}</p>
                    </div>
                    <a href={`mailto:${inquiry.email}`} className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                        <Mail className="h-4 w-4" />Reply via email
                    </a>
                </div>

                <div className="space-y-3 rounded border border-border bg-surface p-6">
                    <h2 className="text-sm font-semibold text-foreground">Status</h2>
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map((s) => (
                            <Button key={s} size="sm" variant={inquiry.status === s ? 'primary' : 'secondary'} onClick={() => updateStatus(s)}>
                                {s}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
