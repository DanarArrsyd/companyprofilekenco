import { ReactNode } from 'react';

export function FormActions({ children }: { children: ReactNode }) {
    return (
        <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
            {children}
        </div>
    );
}
