import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
    published: 'bg-success/10 text-success',
    active: 'bg-success/10 text-success',
    open: 'bg-success/10 text-success',
    new: 'bg-primary/10 text-primary',
    draft: 'bg-muted text-muted-foreground',
    submitted: 'bg-muted text-muted-foreground',
    pending: 'bg-warning/10 text-warning',
    reviewed: 'bg-warning/10 text-warning',
    archived: 'bg-danger/10 text-danger',
    suspended: 'bg-danger/10 text-danger',
    rejected: 'bg-danger/10 text-danger',
    closed: 'bg-danger/10 text-danger',
};

export function StatusBadge({ status }: { status: string }) {
    const key = status.toLowerCase();

    return (
        <span
            className={cn(
                'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize',
                STATUS_STYLES[key] ?? 'bg-muted text-muted-foreground',
            )}
        >
            {status}
        </span>
    );
}
