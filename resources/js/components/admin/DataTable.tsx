import { ReactNode } from 'react';

import { LoadingState } from '@/components/admin/LoadingState';

export interface DataTableColumn<T> {
    key: string;
    header: string;
    render: (row: T) => ReactNode;
    className?: string;
}

export function DataTable<T extends { id: number | string }>({
    columns,
    data,
    isLoading,
    emptyState,
}: {
    columns: DataTableColumn<T>[];
    data: T[];
    isLoading?: boolean;
    emptyState?: ReactNode;
}) {
    if (isLoading) {
        return <LoadingState />;
    }

    if (data.length === 0 && emptyState) {
        return <>{emptyState}</>;
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                    <tr className="border-b border-border bg-muted/50">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                scope="col"
                                className={cnHeader(column.className)}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {data.map((row) => (
                        <tr key={row.id} className="hover:bg-muted/30">
                            {columns.map((column) => (
                                <td key={column.key} className={cnCell(column.className)}>
                                    {column.render(row)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function cnHeader(extra?: string) {
    return ['px-5 py-3.5 font-medium text-slate-700', extra].filter(Boolean).join(' ');
}

function cnCell(extra?: string) {
    return ['px-5 py-4 text-foreground', extra].filter(Boolean).join(' ');
}
