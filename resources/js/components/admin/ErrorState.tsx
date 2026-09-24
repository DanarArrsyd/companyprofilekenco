import { AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

export function ErrorState({
    title = 'Something went wrong',
    description,
    onRetry,
    action,
}: {
    title?: string;
    description?: string;
    onRetry?: () => void;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface px-6 py-16 text-center">
            <AlertTriangle className="mb-4 h-8 w-8 text-danger" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">{title}</p>
            {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
            {onRetry && (
                <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
                    Try again
                </Button>
            )}
            {action}
        </div>
    );
}
