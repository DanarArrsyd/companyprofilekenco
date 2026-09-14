import { ReactNode } from 'react';

export function FormSection({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <div className="grid grid-cols-1 gap-6 border-b border-border py-6 first:pt-0 last:border-b-0 lg:grid-cols-3">
            <div>
                <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>

            <div className="space-y-4 lg:col-span-2">{children}</div>
        </div>
    );
}
