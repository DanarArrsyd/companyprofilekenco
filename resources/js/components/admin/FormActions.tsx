import { ReactNode } from 'react';

export function FormActions({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border py-6">
            {children}
        </div>
    );
}
