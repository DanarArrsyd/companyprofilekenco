import { ReactNode } from 'react';

/** Short "how to fill this in" line under an admin form field. Link it with aria-describedby. */
export function FieldHint({ id, children }: { id?: string; children: ReactNode }) {
    return (
        <p id={id} className="mt-1.5 text-xs leading-relaxed text-slate-500">
            {children}
        </p>
    );
}
