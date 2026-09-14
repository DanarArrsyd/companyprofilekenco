import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded border border-dashed border-border bg-surface px-6 py-16 text-center">
            {Icon && <Icon className="mb-4 h-8 w-8 text-muted-foreground" aria-hidden="true" />}
            <p className="text-sm font-medium text-foreground">{title}</p>
            {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
