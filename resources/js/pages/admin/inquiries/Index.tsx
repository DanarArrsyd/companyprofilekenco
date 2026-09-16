import { Head, Link, router } from '@inertiajs/react';
import { Bell } from 'lucide-react';
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

interface InquiryRow {
    id: number;
    name: string;
    company: string | null;
    subject: string | null;
    status: string;
    created_at: string;
}

export default function Index({
    inquiries,
    filters,
    statusOptions,
}: {
    inquiries: { data: InquiryRow[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { search?: string; status?: string; date?: string };
    statusOptions: string[];
}) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (overrides: Record<string, unknown>) => {
        router.get(route('admin.inquiries'), { ...filters, ...overrides }, { preserveState: true, replace: true });
    };

    const columns: DataTableColumn<InquiryRow>[] = [
        { key: 'name', header: 'Sender', render: (row) => <span className="font-medium text-foreground">{row.name}</span> },
        { key: 'company', header: 'Company', render: (row) => row.company ?? '—' },
        { key: 'subject', header: 'Subject', render: (row) => row.subject ?? '—' },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        { key: 'created_at', header: 'Date', render: (row) => new Date(row.created_at).toLocaleDateString() },
        {
            key: 'actions', header: '', className: 'text-right',
            render: (row) => (
                <Link href={route('admin.inquiries.show', row.id)}>
                    <Button size="sm" variant="secondary">View</Button>
                </Link>
            ),
        },
    ];

    return (
        <AdminLayout>
            <Head title="Contact Inquiries" />

            <PageHeader title="Contact Inquiries" description="Review contact form submissions." />

            <div className="space-y-4">
                <FilterBar>
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                        placeholder="Search sender or email…"
                        className="max-w-sm"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <select value={filters.status ?? ''} onChange={(e) => applyFilters({ status: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm">
                            <option value="">All statuses</option>
                            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input type="date" value={filters.date ?? ''} onChange={(e) => applyFilters({ date: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm" />
                    </div>
                </FilterBar>

                {inquiries.data.length === 0 ? (
                    <EmptyState icon={Bell} title="No inquiries yet" />
                ) : (
                    <DataTable columns={columns} data={inquiries.data} />
                )}

                <Pagination links={inquiries.links} />
            </div>
        </AdminLayout>
    );
}
