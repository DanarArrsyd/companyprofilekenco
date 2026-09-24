import { ReactNode } from 'react';

export function FilterBar({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            {children}
        </div>
    );
}
