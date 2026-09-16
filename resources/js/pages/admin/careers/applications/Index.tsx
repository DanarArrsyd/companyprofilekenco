import { Head, Link, router } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { useState } from 'react';

import { DataTable, DataTableColumn } from '@/components/admin/DataTable';
import { EmptyState } from '@/components/admin/EmptyState';
import { FilterBar } from '@/components/admin/FilterBar';
import { PageHeader } from '@/components/admin/PageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { SearchInput } from '@/components/admin/SearchInput';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/AdminLayout';

interface ApplicationRow {
    id: number;
    applicant_name: string;
    applicant_email: string;
    status: string;
    created_at: string;
    jobVacancy: { id: number; title: string };
}

export default function Index({
    applications,
    filters,
    vacancies,
    statusOptions,
}: {
    applications: { data: ApplicationRow[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { search?: string; vacancy?: string; status?: string; date?: string };
    vacancies: { id: number; title: string }[];
    statusOptions: string[];
}) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (overrides: Record<string, unknown>) => {
        router.get(route('admin.careers.applications'), { ...filters, ...overrides }, { preserveState: true, replace: true });
    };

    const columns: DataTableColumn<ApplicationRow>[] = [
        { key: 'applicant_name', header: 'Applicant', render: (row) => <span className="font-medium text-foreground">{row.applicant_name}</span> },
        { key: 'jobVacancy', header: 'Vacancy', render: (row) => row.jobVacancy.title },
        { key: 'applicant_email', header: 'Email', render: (row) => row.applicant_email },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        { key: 'created_at', header: 'Submitted', render: (row) => new Date(row.created_at).toLocaleDateString() },
        {
            key: 'actions', header: '', className: 'text-right',
            render: (row) => (
                <Link href={route('admin.careers.applications.show', row.id)}>
                    <Button size="sm" variant="secondary">View</Button>
                </Link>
            ),
        },
    ];

    return (
        <AdminLayout>
            <Head title="Job Applications" />

            <PageHeader title="Job Applications" description="Review candidate applications." />

            <div className="space-y-4">
                <FilterBar>
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                        placeholder="Search applicants…"
                        className="max-w-sm"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <select value={filters.vacancy ?? ''} onChange={(e) => applyFilters({ vacancy: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm">
                            <option value="">All vacancies</option>
                            {vacancies.map((v) => <option key={v.id} value={v.id}>{v.title}</option>)}
                        </select>
                        <select value={filters.status ?? ''} onChange={(e) => applyFilters({ status: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm">
                            <option value="">All statuses</option>
                            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input type="date" value={filters.date ?? ''} onChange={(e) => applyFilters({ date: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm" />
                    </div>
                </FilterBar>

                {applications.data.length === 0 ? (
                    <EmptyState icon={Users} title="No applications yet" />
                ) : (
                    <DataTable columns={columns} data={applications.data} />
                )}

                <Pagination links={applications.links} />
            </div>
        </AdminLayout>
    );
}
