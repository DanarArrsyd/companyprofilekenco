import { Head, useForm } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { FormEventHandler } from 'react';

import { FormActions } from '@/components/admin/FormActions';
import { FormSection } from '@/components/admin/FormSection';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';

interface Application {
    id: number;
    applicant_name: string;
    applicant_email: string;
    applicant_phone: string | null;
    applicant_address: string | null;
    cover_letter: string | null;
    status: string;
    notes: string | null;
    created_at: string;
    jobVacancy: { id: number; title: string };
}

export default function Show({ application, statusOptions }: { application: Application; statusOptions: string[] }) {
    const { data, setData, put, processing } = useForm({
        status: application.status,
        notes: application.notes ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.careers.applications.status', application.id));
    };

    return (
        <AdminLayout>
            <Head title={`Application - ${application.applicant_name}`} />

            <PageHeader
                title={application.applicant_name}
                description={`Applied for ${application.jobVacancy.title}`}
                breadcrumbs={[{ label: 'Applications', href: route('admin.careers.applications') }, { label: application.applicant_name }]}
                actions={<StatusBadge status={application.status} />}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-4 rounded-lg border border-border bg-surface p-6 sm:p-8 lg:col-span-2">
                    <div>
                        <Label>Email</Label>
                        <p className="mt-1 text-sm text-foreground">{application.applicant_email}</p>
                    </div>
                    <div>
                        <Label>Phone</Label>
                        <p className="mt-1 text-sm text-foreground">{application.applicant_phone ?? '—'}</p>
                    </div>
                    <div>
                        <Label>Address</Label>
                        <p className="mt-1 text-sm text-foreground">{application.applicant_address ?? '—'}</p>
                    </div>
                    <div>
                        <Label>Cover Letter</Label>
                        <p className="mt-1 whitespace-pre-line text-sm text-foreground">{application.cover_letter ?? '—'}</p>
                    </div>
                    <div>
                        <Label>CV</Label>
                        <a href={route('admin.careers.applications.cv', application.id)} className="mt-1 inline-flex items-center gap-2 text-sm text-primary hover:underline">
                            <Download className="h-4 w-4" />Download CV
                        </a>
                    </div>
                    <div>
                        <Label>Submitted</Label>
                        <p className="mt-1 text-sm text-foreground">{new Date(application.created_at).toLocaleString()}</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-4 rounded-lg border border-border bg-surface p-6 sm:p-8">
                    <FormSection title="Status">
                        <div>
                            <Label htmlFor="status">Application status</Label>
                            <select id="status" value={data.status} onChange={(e) => setData('status', e.target.value)} className="mt-1.5 h-11 w-full rounded border border-border bg-surface px-3 text-sm">
                                {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="notes">Internal notes</Label>
                            <textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={5} className="mt-1.5 w-full rounded border border-border bg-surface px-3 py-2 text-sm" />
                        </div>
                    </FormSection>
                    <FormActions>
                        <Button type="submit" disabled={processing}>Update Status</Button>
                    </FormActions>
                </form>
            </div>
        </AdminLayout>
    );
}
