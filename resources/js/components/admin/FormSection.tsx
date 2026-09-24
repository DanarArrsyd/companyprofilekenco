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
        <div className="grid grid-cols-1 gap-5 border-b border-border py-8 last:border-b-0 lg:grid-cols-3 lg:gap-10">
            <div>
                <h2 className="text-base font-semibold text-foreground">{title}</h2>
                {description && <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>}
            </div>

            <div className="space-y-5 lg:col-span-2">{children}</div>
        </div>
    );
}
