import { ReactNode } from 'react';

/** One titled block of an Edit page: what the fields are and where they show. */
export function EditCard({
    title,
    description,
    actions,
    children,
}: {
    title: string;
    description?: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="rounded-lg border border-border bg-surface">
            <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6">
                <div className="min-w-0">
                    <h2 className="text-base font-semibold text-foreground">{title}</h2>
                    {description && <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>}
                </div>
                {actions && <div className="flex shrink-0 flex-wrap items-center gap-4">{actions}</div>}
            </div>
            <div className="space-y-5 px-5 pb-6 pt-5 sm:px-6">{children}</div>
        </section>
    );
}
