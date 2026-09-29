import { ExternalLink } from 'lucide-react';
import { FormEventHandler, ReactNode } from 'react';

import { Breadcrumb, BreadcrumbItem } from '@/components/admin/Breadcrumb';

/**
 * Uniform admin Edit page (approved mockup 2026-09-29): content cards on the
 * left, a side panel on the right that stays in view (status, the one save
 * button, preview, where it shows). The whole page is one form, so the panel's
 * button saves everything on it.
 */
export function EditPageLayout({
    eyebrow,
    title,
    breadcrumbs,
    viewUrl,
    onSubmit,
    aside,
    children,
}: {
    eyebrow: string;
    title: string;
    breadcrumbs: BreadcrumbItem[];
    /** Public page of this item, when it has one. */
    viewUrl?: string | null;
    onSubmit: FormEventHandler;
    aside: ReactNode;
    children: ReactNode;
}) {
    return (
        <form onSubmit={onSubmit} noValidate>
            <div className="mb-6 space-y-4">
                <Breadcrumb items={breadcrumbs} />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{eyebrow}</p>
                        <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-navy-950">{title}</h1>
                    </div>
                    {viewUrl && (
                        <a
                            href={viewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-10 shrink-0 items-center gap-2 rounded border border-border bg-surface px-4 text-sm font-medium text-foreground hover:bg-muted"
                        >
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            Lihat di website
                        </a>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="min-w-0 space-y-5">{children}</div>
                <aside className="space-y-4 lg:sticky lg:top-6">{aside}</aside>
            </div>
        </form>
    );
}
