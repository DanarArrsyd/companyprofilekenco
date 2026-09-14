import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const VARIANT_STYLES = {
    success: { icon: CheckCircle2, className: 'border-success/30 bg-white text-foreground', iconClassName: 'text-success' },
    error: { icon: XCircle, className: 'border-danger/30 bg-white text-foreground', iconClassName: 'text-danger' },
    warning: { icon: TriangleAlert, className: 'border-warning/30 bg-white text-foreground', iconClassName: 'text-warning' },
    info: { icon: Info, className: 'border-navy-700/30 bg-white text-foreground', iconClassName: 'text-navy-700' },
} as const;

export function Toaster() {
    const { toasts, dismiss } = useToast();

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div
            className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
            role="status"
            aria-live="polite"
        >
            {toasts.map((item) => {
                const variant = VARIANT_STYLES[item.variant];
                const Icon = variant.icon;

                return (
                    <div
                        key={item.id}
                        className={cn(
                            'pointer-events-auto flex items-start gap-3 rounded border px-4 py-3 text-sm shadow-sm',
                            variant.className,
                        )}
                    >
                        <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', variant.iconClassName)} aria-hidden="true" />
                        <p className="flex-1">{item.message}</p>
                        <button
                            type="button"
                            onClick={() => dismiss(item.id)}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Dismiss notification"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
