import { Head, router } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';
import { useState } from 'react';

import { DataTable, DataTableColumn } from '@/components/admin/DataTable';
import { EmptyState } from '@/components/admin/EmptyState';
import { FilterBar } from '@/components/admin/FilterBar';
import { PageHeader } from '@/components/admin/PageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { SearchInput } from '@/components/admin/SearchInput';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/AdminLayout';

interface LogRow {
    id: number;
    action: string;
    module: string;
    user: string | null;
    subject_type: string | null;
    subject_label: string | null;
    ip_address: string | null;
    created_at: string;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    properties: Record<string, unknown>;
}

function DiffPanel({ log, onClose }: { log: LogRow; onClose: () => void }) {
    const keys = new Set([
        ...Object.keys(log.old_values ?? {}),
        ...Object.keys(log.new_values ?? {}),
    ]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded border border-border bg-surface p-6" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-sm font-semibold text-foreground">{log.action}</h2>
                <p className="mt-1 text-xs text-slate-500">
                    {log.user ?? 'System'} · {new Date(log.created_at).toLocaleString()} · {log.ip_address ?? '—'}
                </p>

                {keys.size > 0 ? (
                    <table className="mt-4 w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs uppercase text-slate-500">
                                <th className="py-1 pr-3">Field</th>
                                <th className="py-1 pr-3">Old value</th>
                                <th className="py-1">New value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...keys].map((key) => (
                                <tr key={key} className="border-b border-border align-top">
                                    <td className="py-2 pr-3 font-medium text-foreground">{key}</td>
                                    <td className="py-2 pr-3 text-slate-500">{formatValue(log.old_values?.[key])}</td>
                                    <td className="py-2 text-foreground">{formatValue(log.new_values?.[key])}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : Object.keys(log.properties).length > 0 ? (
                    <pre className="mt-4 overflow-x-auto rounded bg-muted p-3 text-xs text-foreground">
                        {JSON.stringify(log.properties, null, 2)}
                    </pre>
                ) : (
                    <p className="mt-4 text-sm text-slate-500">No additional detail recorded for this event.</p>
                )}

                <div className="mt-6 flex justify-end">
                    <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
}

function formatValue(value: unknown): string {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

export default function Index({
    logs,
    filters,
    users,
    modules,
}: {
    logs: { data: LogRow[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { user?: string; module?: string; search?: string; from?: string; to?: string };
    users: { id: number; name: string }[];
    modules: string[];
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selected, setSelected] = useState<LogRow | null>(null);

    const applyFilters = (overrides: Record<string, unknown>) => {
        router.get(route('admin.activity-logs'), { ...filters, ...overrides }, { preserveState: true, replace: true });
    };

    const columns: DataTableColumn<LogRow>[] = [
        { key: 'created_at', header: 'Timestamp', render: (row) => new Date(row.created_at).toLocaleString() },
        { key: 'user', header: 'User', render: (row) => row.user ?? 'System' },
        { key: 'action', header: 'Action', render: (row) => row.action },
        { key: 'module', header: 'Module', render: (row) => row.module },
        { key: 'subject', header: 'Subject', render: (row) => row.subject_type ? `${row.subject_type} ${row.subject_label ?? ''}` : '—' },
        {
            key: 'actions', header: '', className: 'text-right',
            render: (row) => <Button size="sm" variant="secondary" onClick={() => setSelected(row)}>Details</Button>,
        },
    ];

    return (
        <AdminLayout>
            <Head title="Activity Logs" />

            <PageHeader title="Activity Logs" description="Read-only history of admin actions." />

            <div className="space-y-6">
                <FilterBar>
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                        placeholder="Search action…"
                        className="max-w-sm"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <select value={filters.user ?? ''} onChange={(e) => applyFilters({ user: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm">
                            <option value="">All users</option>
                            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                        <select value={filters.module ?? ''} onChange={(e) => applyFilters({ module: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm">
                            <option value="">All modules</option>
                            {modules.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <input type="date" value={filters.from ?? ''} onChange={(e) => applyFilters({ from: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm" />
                        <input type="date" value={filters.to ?? ''} onChange={(e) => applyFilters({ to: e.target.value })} className="h-10 rounded border border-border bg-surface px-3 text-sm" />
                    </div>
                </FilterBar>

                {logs.data.length === 0 ? (
                    <EmptyState icon={ClipboardList} title="No activity recorded yet" />
                ) : (
                    <DataTable columns={columns} data={logs.data} />
                )}

                <Pagination links={logs.links} />
            </div>

            {selected && <DiffPanel log={selected} onClose={() => setSelected(null)} />}
        </AdminLayout>
    );
}
