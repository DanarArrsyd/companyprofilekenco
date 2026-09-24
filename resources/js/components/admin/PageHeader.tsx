import { ReactNode } from 'react';

import { Breadcrumb, BreadcrumbItem } from '@/components/admin/Breadcrumb';

export function PageHeader({
    title,
    description,
    breadcrumbs,
    actions,
}: {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: ReactNode;
}) {
    return (
        <div className="mb-8 space-y-4">
            {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-foreground">{title}</h1>
                    {description && <p className="mt-1.5 text-sm text-slate-500">{description}</p>}
                </div>

                {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
            </div>
        </div>
    );
}
