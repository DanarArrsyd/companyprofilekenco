import { Link } from '@inertiajs/react';

import { cn } from '@/lib/utils';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export function Pagination({ links }: { links: PaginationLink[] }) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <nav aria-label="Pagination" className="flex flex-wrap items-center gap-1">
            {links.map((link, index) =>
                link.url === null ? (
                    <span
                        key={index}
                        aria-disabled="true"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        className="inline-flex h-9 min-w-9 cursor-not-allowed items-center justify-center rounded px-2 text-sm text-muted-foreground"
                    />
                ) : (
                    <Link
                        key={index}
                        href={link.url}
                        preserveScroll
                        aria-current={link.active ? 'page' : undefined}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        className={cn(
                            'inline-flex h-9 min-w-9 items-center justify-center rounded px-2 text-sm',
                            link.active ? 'bg-primary text-primary-foreground' : 'text-slate-700 hover:bg-muted',
                        )}
                    />
                ),
            )}
        </nav>
    );
}
