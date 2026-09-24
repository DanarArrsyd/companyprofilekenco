import { ImageOff } from 'lucide-react';

import { useLocale } from '@/hooks/use-locale';

/**
 * Restrained fallback for a missing image — a neutral surface with a small
 * icon and label, not a flat dark block that reads as a broken page.
 * Invisible whenever a real image is present; only shown in its absence.
 */
export function ImagePlaceholder({ label, className = '' }: { label?: string; className?: string }) {
    const { t } = useLocale();
    return (
        <div className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-muted ${className}`}>
            <ImageOff className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
            <span className="text-caption uppercase text-muted-foreground">{label ?? t('Image unavailable')}</span>
        </div>
    );
}
